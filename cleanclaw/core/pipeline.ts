import fs from 'fs';
import path from 'path';
import { getConfig } from './config-loader.js';
import { resolveBridge, resolveLanguageAgent } from './agent-router.js';
import { PlanningAgent } from './planning-agent.js';
import { BossAgent } from './boss-agent.js';
import { promptApproval, promptApprovalForFile } from './verification-layer.js';
import { captureBeforeState } from '../plans/diff-capture.js';
import { appendLogEntry } from '../plans/log-writer.js';
import { parseTaskPlanSteps, markStepComplete } from '../plans/plan-writer.js';
import type { CleanClawConfig } from '../config/config-schema.js';
import type { TaskStep } from '../plans/plan-writer.js';
import type { ProposedChange } from './language-agent.js';
import type { DiffCapture } from '../plans/diff-capture.js';
import type { LanguageAgent } from './language-agent.js';
import type { Bridge } from '../bridges/anthropic-bridge.js';

// ─── Task ID ──────────────────────────────────────────────────────────────────

function getNextTaskId(plansDir: string): string {
  if (!fs.existsSync(plansDir)) {
    return '01';
  }
  const entries = fs.readdirSync(plansDir, { withFileTypes: true });
  const taskDirs = entries.filter(e => e.isDirectory() && /^task\d+$/.test(e.name));
  return String(taskDirs.length + 1).padStart(2, '0');
}

function resolveModel(config: CleanClawConfig): string {
  if (config.provider === 'anthropic') return config.anthropic?.model ?? 'claude-sonnet-4-5';
  if (config.provider === 'openai') return config.openai?.model ?? 'gpt-4o';
  return 'unknown';
}

// ─── Filename validation ──────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function fuzzyMatchFilename(proposed: string, searchRoot: string): string | null {
  const name = path.basename(proposed);
  const threshold = Math.max(2, Math.floor(name.length * 0.2));
  let bestMatch: string | null = null;
  let bestDist = Infinity;

  function walk(dir: string): void {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const dist = levenshtein(name, entry.name);
        if (dist <= threshold && dist < bestDist) {
          bestDist = dist;
          bestMatch = full;
        }
      }
    }
  }

  walk(searchRoot);
  return bestMatch;
}

async function validateFilename(proposed: ProposedChange): Promise<boolean> {
  if (fs.existsSync(proposed.filename)) return true;

  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const fuzzyMatch = fuzzyMatchFilename(proposed.filename, process.cwd());
  if (fuzzyMatch) {
    console.log(`\n⚠ "${proposed.filename}" does not exist.`);
    console.log(`  Did you mean: "${fuzzyMatch}"?`);
    const answer = await new Promise<string>(resolve => {
      rl.question('  [y = use match / n = create new / c = cancel]: ', ans => { rl.close(); resolve(ans.trim().toLowerCase()); });
    });
    if (answer === 'y') {
      proposed.filename = fuzzyMatch;
      return true;
    }
    if (answer === 'n') {
      const confirm = await new Promise<string>(resolve => {
        const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl2.question(`  Create new file "${proposed.filename}"? [y/N]: `, ans => { rl2.close(); resolve(ans.trim().toLowerCase()); });
      });
      return confirm === 'y';
    }
    return false;
  }

  console.log(`\n⚠ WARNING: "${proposed.filename}" does not exist on disk.`);
  const confirm = await new Promise<string>(resolve => {
    rl.question('This would create a NEW FILE. Confirm? [y/N]: ', ans => { rl.close(); resolve(ans.trim()); });
  });
  return confirm.toLowerCase() === 'y';
}

// ─── Per-change pipeline ──────────────────────────────────────────────────────

async function runPipelinePerChange(
  steps: TaskStep[],
  taskId: string,
  variant: string,
  planPath: string,
  completedPlanPath: string,
  plansDir: string,
  config: CleanClawConfig,
  languageAgent: LanguageAgent,
  bridge: Bridge,
): Promise<void> {
  const model = resolveModel(config);
  let changeNumber = 1;

  for (const step of steps) {
    console.log(`\n[CleanClaw] Step ${step.number}: ${step.body.slice(0, 80)}...`);

    const proposed = await languageAgent.propose(step.body, bridge);
    const accepted = await validateFilename(proposed);

    if (!accepted) {
      console.log('[CleanClaw] New file creation rejected. Skipping step.');
      appendLogEntry(taskId, variant, changeNumber, proposed,
        { filename: proposed.filename, lines: [], isNewFile: true },
        'new-file creation rejected by developer', model, plansDir, config.logFormat ?? 'markdown');
      changeNumber++;
      continue;
    }

    // Re-propose with actual file content so the agent isn't guessing at line contents
    const rawContent = fs.readFileSync(proposed.filename, 'utf-8');
    const numberedContent = rawContent.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n');
    const enrichedStep = `${step.body}\n\nCurrent file content (${proposed.filename}):\n${numberedContent}`;
    const refined = await languageAgent.propose(enrichedStep, bridge);
    refined.filename = proposed.filename;
    Object.assign(proposed, refined);

    const lineNumbers = proposed.beforeLines.map(l => l.lineNumber);
    const before = captureBeforeState(proposed.filename, lineNumbers);
    const { approved, why } = await promptApproval(proposed, before);

    if (!approved) {
      console.log('[CleanClaw] Change rejected. Moving to next step.');
      appendLogEntry(taskId, variant, changeNumber, proposed, before, why, model, plansDir, config.logFormat ?? 'markdown');
      changeNumber++;
      continue;
    }

    applyChange(proposed);
    appendLogEntry(taskId, variant, changeNumber, proposed, before, why, model, plansDir, config.logFormat ?? 'markdown');
    markStepComplete(planPath, step.body, completedPlanPath);
    console.log(`[CleanClaw] Change ${changeNumber} applied and logged.`);
    changeNumber++;
  }

  printSummary(taskId, variant, changeNumber, plansDir);
}

// ─── Per-file pipeline ────────────────────────────────────────────────────────

async function runPipelinePerFile(
  steps: TaskStep[],
  taskId: string,
  variant: string,
  planPath: string,
  completedPlanPath: string,
  plansDir: string,
  config: CleanClawConfig,
  languageAgent: LanguageAgent,
  bridge: Bridge,
): Promise<void> {
  const model = resolveModel(config);

  // Phase 1: collect all proposals
  type CollectedChange = { step: TaskStep; proposed: ProposedChange; before: DiffCapture };
  const collected: CollectedChange[] = [];

  for (const step of steps) {
    console.log(`\n[CleanClaw] Proposing step ${step.number}: ${step.body.slice(0, 80)}...`);
    const proposed = await languageAgent.propose(step.body, bridge);
    const accepted = await validateFilename(proposed);

    if (!accepted) {
      console.log('[CleanClaw] New file creation rejected. Skipping step.');
      continue;
    }

    // Re-propose with actual file content so the agent isn't guessing at line contents
    const rawContent = fs.readFileSync(proposed.filename, 'utf-8');
    const numberedContent = rawContent.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n');
    const enrichedStep = `${step.body}\n\nCurrent file content (${proposed.filename}):\n${numberedContent}`;
    const refined = await languageAgent.propose(enrichedStep, bridge);
    refined.filename = proposed.filename;
    Object.assign(proposed, refined);

    const lineNumbers = proposed.beforeLines.map(l => l.lineNumber);
    const before = captureBeforeState(proposed.filename, lineNumbers);
    collected.push({ step, proposed, before });
  }

  // Phase 2: group by filename
  const fileGroups = new Map<string, CollectedChange[]>();
  for (const item of collected) {
    const existing = fileGroups.get(item.proposed.filename) ?? [];
    existing.push(item);
    fileGroups.set(item.proposed.filename, existing);
  }

  // Phase 3: prompt once per file, apply all or skip all
  let changeNumber = 1;
  for (const [, group] of fileGroups) {
    const proposals = group.map(g => g.proposed);
    const befores = group.map(g => g.before);
    const { approved, why } = await promptApprovalForFile(proposals, befores);

    if (!approved) {
      console.log('[CleanClaw] File changes rejected. Skipping.');
      for (const { proposed, before } of group) {
        appendLogEntry(taskId, variant, changeNumber, proposed, before, why, model, plansDir, config.logFormat ?? 'markdown');
        changeNumber++;
      }
      continue;
    }

    for (const { proposed, before, step } of group) {
      applyChange(proposed);
      appendLogEntry(taskId, variant, changeNumber, proposed, before, why, model, plansDir, config.logFormat ?? 'markdown');
      markStepComplete(planPath, step.body, completedPlanPath);
      console.log(`[CleanClaw] Change ${changeNumber} applied and logged.`);
      changeNumber++;
    }
  }

  printSummary(taskId, variant, changeNumber, plansDir);
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function runPipeline(taskDescription: string, config: CleanClawConfig): Promise<void> {
  const plansDir = path.resolve(config.plansDir);
  const bridge = resolveBridge(config);
  const languageAgent = resolveLanguageAgent(config);
  const planningAgent = new PlanningAgent(bridge);
  const boss = new BossAgent(planningAgent, plansDir);

  const taskId = getNextTaskId(plansDir);
  const variant = 'A';

  // Phase 1 — Generate and write plan
  const { planPath, planContent } = await boss.run(taskDescription, taskId, variant);
  const completedPlanPath = planPath.replace('_plan.md', '_plan_completed.md');

  // Phase 2 — Parse steps
  const steps = parseTaskPlanSteps(planContent);

  // Plan review — show plan content and ask to confirm before executing
  console.log('\n─────────────────────────────────────────');
  console.log('GENERATED PLAN');
  console.log('─────────────────────────────────────────');
  console.log(planContent);
  console.log('─────────────────────────────────────────');
  console.log(`Plan written: ${planPath}`);
  console.log(`Steps to execute: ${steps.length}`);
  console.log('─────────────────────────────────────────\n');

  if (steps.length === 0) {
    console.log('[CleanClaw] No executable steps found. Review the plan manually.');
    return;
  }

  const { createInterface } = await import('readline');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const proceed = await new Promise<string>(resolve => {
    rl.question('Proceed with these steps? [y/n]: ', answer => { rl.close(); resolve(answer.trim()); });
  });

  if (proceed.toLowerCase() !== 'y') {
    console.log('[CleanClaw] Task cancelled. Plan saved to:', planPath);
    return;
  }

  // Phase 3 — Execute with configured granularity
  const granularity = config.approvalGranularity ?? 'per-change';

  if (granularity === 'per-file') {
    await runPipelinePerFile(steps, taskId, variant, planPath, completedPlanPath, plansDir, config, languageAgent, bridge);
  } else {
    await runPipelinePerChange(steps, taskId, variant, planPath, completedPlanPath, plansDir, config, languageAgent, bridge);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function printSummary(taskId: string, variant: string, changeNumber: number, plansDir: string): void {
  console.log('\n─────────────────────────────────────────');
  console.log(`[CleanClaw] Task ${taskId}${variant} complete. ${changeNumber - 1} change(s) processed.`);
  console.log(`Log: ${path.join(plansDir, `task${taskId}`, `task${taskId}${variant}_log.md`)}`);
  console.log('─────────────────────────────────────────');
}

function applyChange(proposed: ProposedChange): void {
  const filePath = proposed.filename;
  const dir = path.dirname(filePath);

  if (dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    const content = proposed.afterLines.map(l => l.content).join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  for (const after of proposed.afterLines) {
    lines[after.lineNumber - 1] = after.content;
  }
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

// ─── Entry point (direct run) ─────────────────────────────────────────────────

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.url.replace('file://', ''))) {
  const taskDescription = process.argv[2];
  if (!taskDescription) {
    console.error('Usage: npx tsx cleanclaw/core/pipeline.ts "Your task description"');
    process.exit(1);
  }
  const config = getConfig();
  runPipeline(taskDescription, config).catch(err => {
    console.error('[CleanClaw] Pipeline failed:', err.message);
    process.exit(1);
  });
}
