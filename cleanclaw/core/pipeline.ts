import fs from 'fs';
import path from 'path';
import { getConfig } from './config-loader.js';
import { resolveBridge, resolveLanguageAgent } from './agent-router.js';
import { PlanningAgent } from './planning-agent.js';
import { BossAgent } from './boss-agent.js';
import { promptApproval } from './verification-layer.js';
import { captureBeforeState } from '../plans/diff-capture.js';
import { appendLogEntry } from '../plans/log-writer.js';
import { parseTaskPlanSteps, markStepComplete } from '../plans/plan-writer.js';
import type { CleanClawConfig } from '../config/config-schema.js';

// ─── Task ID ──────────────────────────────────────────────────────────────────

function getNextTaskId(plansDir: string): string {
  if (!fs.existsSync(plansDir)) {
    return '01';
  }
  const entries = fs.readdirSync(plansDir, { withFileTypes: true });
  const taskDirs = entries.filter(e => e.isDirectory() && /^task\d+$/.test(e.name));
  return String(taskDirs.length + 1).padStart(2, '0');
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

  // Phase 2 — Parse steps from the plan (numbered list format from planning agent)
  const steps = parseTaskPlanSteps(planContent);

  console.log('\n─────────────────────────────────────────');
  console.log(`Plan written: ${planPath}`);
  console.log(`Steps to execute: ${steps.length}`);
  console.log('─────────────────────────────────────────\n');

  if (steps.length === 0) {
    console.log('[CleanClaw] No executable steps found. Review the plan manually.');
    return;
  }

  // Phase 3 — Execute each step: propose → validate filename → approve → log → mark done
  let changeNumber = 1;

  for (const step of steps) {
    console.log(`\n[CleanClaw] Step ${step.number}: ${step.body.slice(0, 80)}...`);

    // Delegate to language agent — never implement inline
    const proposed = await languageAgent.propose(step.body, bridge);

    // Filename validation — guard against hallucinated paths
    if (!fs.existsSync(proposed.filename)) {
      console.log(`\n⚠ WARNING: "${proposed.filename}" does not exist on disk.`);
      const readline = await import('readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const confirm = await new Promise<string>(resolve => {
        rl.question('This would create a NEW FILE. Confirm? [y/N]: ', ans => { rl.close(); resolve(ans.trim()); });
      });
      if (confirm.toLowerCase() !== 'y') {
        console.log('[CleanClaw] New file creation rejected. Skipping step.');
        appendLogEntry(taskId, variant, changeNumber, proposed,
          { filename: proposed.filename, lines: [], isNewFile: true },
          'new-file creation rejected by developer', config.anthropic?.model ?? 'unknown',
          plansDir, config.logFormat ?? 'markdown');
        changeNumber++;
        continue;
      }
    }

    // Capture actual before state from disk
    const lineNumbers = proposed.beforeLines.map(l => l.lineNumber);
    const before = captureBeforeState(proposed.filename, lineNumbers);

    // Present change for approval — never apply without explicit yes
    const { approved, why } = await promptApproval(proposed, before);

    if (!approved) {
      console.log('[CleanClaw] Change rejected. Moving to next step.');
      appendLogEntry(taskId, variant, changeNumber, proposed, before, why,
        config.anthropic?.model ?? 'unknown', plansDir, config.logFormat ?? 'markdown');
      changeNumber++;
      continue;
    }

    // Apply the change to disk
    applyChange(proposed);

    // Log the approved change
    appendLogEntry(taskId, variant, changeNumber, proposed, before, why,
      config.anthropic?.model ?? 'unknown', plansDir, config.logFormat ?? 'markdown');

    // Mark step complete in the completed plan copy
    markStepComplete(planPath, step.body, completedPlanPath);

    console.log(`[CleanClaw] Change ${changeNumber} applied and logged.`);
    changeNumber++;
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`[CleanClaw] Task ${taskId}${variant} complete. ${changeNumber - 1} change(s) processed.`);
  console.log(`Log: ${path.join(plansDir, `task${taskId}`, `task${taskId}${variant}_log.md`)}`);
  console.log('─────────────────────────────────────────');
}

// ─── File Write ───────────────────────────────────────────────────────────────

function applyChange(proposed: import('./language-agent.js').ProposedChange): void {
  const filePath = proposed.filename;
  const dir = path.dirname(filePath);

  if (dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    // New file — write all afterLines
    const content = proposed.afterLines.map(l => l.content).join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    return;
  }

  // Existing file — replace the specified lines
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
