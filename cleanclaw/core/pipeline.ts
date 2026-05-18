import fs from 'fs';
import path from 'path';
import { getConfig } from './config-loader.js';
import { resolveBridge, resolveLanguageAgent } from './agent-router.js';
import { PlanningAgent } from './planning-agent.js';
import { BossAgent } from './boss-agent.js';
import { promptApproval, promptApprovalForFile, autoApprove } from './verification-layer.js';
import { captureBeforeState } from '../plans/diff-capture.js';
import { appendLogEntry } from '../plans/log-writer.js';
import { parseTaskPlanSteps, markStepComplete } from '../plans/plan-writer.js';
import { checkScope, formatHaltMessage } from '../scope/scope-guard.js';
import { assertWithinProjectRoot, RootViolationError } from './root-guard.js';
import { saveState, loadState } from './state-manager.js';
import { triggerProjectMapUpdate } from '../projectmap/updater.js';
import { queryProjectMap } from '../projectmap/query-bridge.js';
import { applyRootPolicy } from './sandbox-policy.js';
import { createConsoleLogger, type CleanClawLogger } from './logger.js';
import { approveFiles, approveWhy, createTaskState, transitionTaskState } from './control-contract.js';
import { appendApprovalRecord, saveTaskState } from './task-records.js';
import { addFileToScopeTree, createScopeTree, formatScopeTree, isFileInScopeTree, saveScopeTree, type ScopeTree } from './scope-tree.js';
import { resolveActiveProject } from './project-resolver.js';
import { resolveProjectSubpath } from './project-paths.js';
import { summarizeRuntimeContext, type CleanClawRuntimeContext, type CleanClawRuntimeContextSummary } from './runtime-context.js';
import { applyGatewayRoutingPolicy, describeGatewayRouting, type GatewayRoutingMode } from './gateway-routing.js';
import type { CleanClawConfig } from '../config/config-schema.js';
import type { TaskStep } from '../plans/plan-writer.js';
import type { ProposedChange } from './language-agent.js';
import type { DiffCapture } from '../plans/diff-capture.js';
import type { LanguageAgent } from './language-agent.js';
import type { Bridge } from '../bridges/anthropic-bridge.js';
import type { ApprovedPlanContext } from '../scope/scope-rules.js';

export interface RunPipelineOptions {
  logger?: CleanClawLogger;
  runtimeContext?: CleanClawRuntimeContext | null;
  gatewayRouting?: GatewayRoutingMode;
}

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

async function validateFilename(
  proposed: ProposedChange,
  headless = false,
  logger: CleanClawLogger = createConsoleLogger(),
): Promise<boolean> {
  if (headless || fs.existsSync(proposed.filename)) return true;

  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const fuzzyMatch = fuzzyMatchFilename(proposed.filename, process.cwd());
  if (fuzzyMatch) {
    logger.info(`\n⚠ "${proposed.filename}" does not exist.`);
    logger.info(`  Did you mean: "${fuzzyMatch}"?`);
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

  logger.info(`\n⚠ WARNING: "${proposed.filename}" does not exist on disk.`);
  const confirm = await new Promise<string>(resolve => {
    rl.question('This would create a NEW FILE. Confirm? [y/N]: ', ans => { rl.close(); resolve(ans.trim()); });
  });
  return confirm.toLowerCase() === 'y';
}

async function ensureFileInVisibleScope(
  scopeTree: ScopeTree,
  proposed: ProposedChange,
  activeRoot: string,
  headless: boolean,
  logger: CleanClawLogger,
): Promise<ScopeTree | null> {
  if (isFileInScopeTree(scopeTree, proposed.filename)) return scopeTree;

  const isNewFile = !fs.existsSync(proposed.filename);
  const kind = isNewFile ? 'planned-new-file' : 'planned-edit';
  const updatedScopeTree = addFileToScopeTree(scopeTree, proposed.filename, kind);

  if (updatedScopeTree.outOfRootRequests.length > scopeTree.outOfRootRequests.length) {
    logger.error(`[CleanClaw] Scope expansion requested outside project root: ${proposed.filename}`);
    return null;
  }

  if (headless) {
    logger.error(`[headless] Scope expansion required for "${proposed.filename}". Stopping.`);
    return null;
  }

  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>(resolve => {
    rl.question([
      '',
      'CleanClaw wants to add a file to the visible workspace scope.',
      `File: ${proposed.filename}`,
      `Scope section: ${kind === 'planned-new-file' ? 'Planned new files' : 'Planned edits'}`,
      `Reason: ${proposed.explanation}`,
      '',
      'Approve this scope expansion? [y/N]: ',
    ].join('\n'), ans => { rl.close(); resolve(ans.trim().toLowerCase()); });
  });

  if (answer !== 'y') {
    logger.info('[CleanClaw] Scope expansion rejected. Skipping step.');
    return null;
  }

  saveScopeTree(activeRoot, updatedScopeTree);
  logger.info('[CleanClaw] Scope tree updated.');
  logger.info(formatScopeTree(updatedScopeTree));
  return updatedScopeTree;
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
  scopeCtx: ApprovedPlanContext,
  activeRoot: string,
  startStepIndex = 0,
  headless = false,
  logger: CleanClawLogger = createConsoleLogger(),
  runtimeContextSummary: CleanClawRuntimeContextSummary | null = null,
  initialScopeTree: ScopeTree | null = null,
): Promise<ScopeTree> {
  const model = resolveModel(config);
  let changeNumber = 1;
  let cumulativeChangeCount = 0;
  let stepIndex = startStepIndex;
  let scopeTree = initialScopeTree ?? createScopeTree({ taskId: `task${taskId}`, projectRoot: activeRoot });

  for (const step of steps) {
    logger.info(`\n[CleanClaw] Step ${step.number}: ${step.body.slice(0, 80)}...`);

    const proposed = await languageAgent.propose(step.body, bridge);
    const accepted = await validateFilename(proposed, headless, logger);

    if (!accepted) {
      logger.info('[CleanClaw] New file creation rejected. Skipping step.');
      appendLogEntry(taskId, variant, changeNumber, proposed,
        { filename: proposed.filename, lines: [], isNewFile: true },
        'new-file creation rejected by developer', model, plansDir, config.logFormat ?? 'markdown');
      changeNumber++;
      continue;
    }

    const approvedScopeTree = await ensureFileInVisibleScope(scopeTree, proposed, activeRoot, headless, logger);
    if (!approvedScopeTree) {
      changeNumber++;
      continue;
    }
    scopeTree = approvedScopeTree;

    // Re-propose with actual file content so the agent isn't guessing at line contents.
    // New files have no current content, so the initial proposal remains the source.
    if (fs.existsSync(proposed.filename)) {
      const rawContent = fs.readFileSync(proposed.filename, 'utf-8');
      const numberedContent = rawContent.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n');
      const enrichedStep = `${step.body}\n\nCurrent file content (${proposed.filename}):\n${numberedContent}`;
      const refined = await languageAgent.propose(enrichedStep, bridge);
      refined.filename = proposed.filename;
      Object.assign(proposed, refined);
    }

    // Scope check before presenting to developer
    const diff = proposed.afterLines.map(l => `+${l.content}`).join('\n');
    const scopeDecision = await checkScope(
      { filename: proposed.filename, diff, cumulativeChangeCount, changeDescription: step.body },
      scopeCtx,
      bridge,
    );

    if (scopeDecision.action === 'halt-confirm') {
      if (headless) {
        logger.error(`[headless] Scope violation on "${proposed.filename}": ${scopeDecision.rationale}`);
        process.exit(1);
      }
      const readline = await import('readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise<string>(resolve => {
        rl.question(formatHaltMessage({ filename: proposed.filename, diff, cumulativeChangeCount, changeDescription: step.body }, scopeDecision), ans => { rl.close(); resolve(ans.trim().toLowerCase()); });
      });

      if (answer === 'r') {
        logger.info('[CleanClaw] Change reversed. Skipping step.');
        changeNumber++;
        continue;
      }

      if (answer === 'e') {
        const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
        const reason = await new Promise<string>(resolve => {
          rl2.question('Explain why this change is acceptable: ', r => { rl2.close(); resolve(r.trim()); });
        });
        logger.info(`[CleanClaw] Explanation recorded: ${reason}`);
        // fall through to normal approval
      }
      // 'a' or explained: fall through
    }

    const lineNumbers = proposed.beforeLines.map(l => l.lineNumber);
    const before = captureBeforeState(proposed.filename, lineNumbers);
    const { approved, why } = headless
      ? autoApprove(proposed, logger)
      : await promptApproval(proposed, before, logger);

    if (!approved) {
      logger.info('[CleanClaw] Change rejected. Moving to next step.');
      appendLogEntry(taskId, variant, changeNumber, proposed, before, why, model, plansDir, config.logFormat ?? 'markdown');
      changeNumber++;
      continue;
    }

    // Hard block — no override, no a/r/e prompt. Safety wall, not a hint.
    try {
      assertWithinProjectRoot(proposed.filename, activeRoot);
    } catch (err) {
      if (err instanceof RootViolationError) {
        logger.error(err.message);
        changeNumber++;
        continue;
      }
      throw err;
    }

    applyChange(proposed);
    triggerProjectMapUpdate(proposed.filename, activeRoot, config, logger);
    appendLogEntry(taskId, variant, changeNumber, proposed, before, why, model, plansDir, config.logFormat ?? 'markdown');
    markStepComplete(planPath, step.body, completedPlanPath, logger);
    logger.info(`[CleanClaw] Change ${changeNumber} applied and logged.`);
    saveState({
      projectName: config.projectName,
      currentTaskId: taskId,
      currentVariant: variant,
      plansDir,
      lastUpdated: new Date().toISOString(),
      iterationCount: 0,
      resumable: true,
      lastCompletedStep: stepIndex,
      runtimeContext: runtimeContextSummary,
    }, activeRoot);
    stepIndex++;
    changeNumber++;
    cumulativeChangeCount++;
  }

  printSummary(taskId, variant, changeNumber, plansDir, logger);
  return scopeTree;
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
  logger: CleanClawLogger = createConsoleLogger(),
): Promise<void> {
  const model = resolveModel(config);

  // Phase 1: collect all proposals
  type CollectedChange = { step: TaskStep; proposed: ProposedChange; before: DiffCapture };
  const collected: CollectedChange[] = [];

  for (const step of steps) {
    logger.info(`\n[CleanClaw] Proposing step ${step.number}: ${step.body.slice(0, 80)}...`);
    const proposed = await languageAgent.propose(step.body, bridge);
    const accepted = await validateFilename(proposed, false, logger);

    if (!accepted) {
      logger.info('[CleanClaw] New file creation rejected. Skipping step.');
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
    const { approved, why } = await promptApprovalForFile(proposals, befores, logger);

    if (!approved) {
      logger.info('[CleanClaw] File changes rejected. Skipping.');
      for (const { proposed, before } of group) {
        appendLogEntry(taskId, variant, changeNumber, proposed, before, why, model, plansDir, config.logFormat ?? 'markdown');
        changeNumber++;
      }
      continue;
    }

    for (const { proposed, before, step } of group) {
      applyChange(proposed);
      triggerProjectMapUpdate(proposed.filename, resolveActiveProject().projectRoot ?? process.cwd(), config, logger);
      appendLogEntry(taskId, variant, changeNumber, proposed, before, why, model, plansDir, config.logFormat ?? 'markdown');
      markStepComplete(planPath, step.body, completedPlanPath, logger);
      logger.info(`[CleanClaw] Change ${changeNumber} applied and logged.`);
      changeNumber++;
    }
  }

  printSummary(taskId, variant, changeNumber, plansDir, logger);
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export interface WorkflowAnswers {
  why: string;
  files: string;
  criteria: string;
  outOfScope: string;
}

export async function runPipeline(
  taskDescription: string,
  config: CleanClawConfig,
  workflowAnswers?: WorkflowAnswers,
  scannedFiles?: string[],
  confirmedFiles?: string[],
  headless = false,
  options: RunPipelineOptions = {},
): Promise<void> {
  const logger = options.logger ?? createConsoleLogger();
  let runtimeContext = options.runtimeContext ?? null;
  const activeRoot = path.resolve(runtimeContext?.activeRoot ?? resolveActiveProject().projectRoot ?? process.cwd());
  const routedConfig = applyGatewayRoutingPolicy(config, {
    mode: options.gatewayRouting ?? 'auto',
    runtimeContext,
  });
  const route = describeGatewayRouting(routedConfig);
  logger.info(`[CleanClaw] Inference routing: ${route.mode}${route.baseURL ? ` via ${route.baseURL}` : ''}`);
  if (runtimeContext) {
    runtimeContext = {
      ...runtimeContext,
      configProvider: routedConfig.provider,
      configModel: route.model,
      auth: {
        ...runtimeContext.auth,
        model: route.model ?? runtimeContext.auth.model,
        endpointUrl: route.baseURL ?? runtimeContext.auth.endpointUrl,
      },
    };
  }
  const runtimeContextSummary = summarizeRuntimeContext(runtimeContext);

  const plansDir = resolveProjectSubpath(activeRoot, routedConfig.plansDir);
  const bridge = resolveBridge(routedConfig);
  const languageAgent = resolveLanguageAgent(routedConfig);
  const planningAgent = new PlanningAgent(bridge);
  const boss = new BossAgent(planningAgent, plansDir, logger);

  // Resume detection — check for incomplete previous run
  const existingState = loadState(activeRoot);
  let resumeFromStep = 0;
  if (existingState?.resumable && !headless) {
    const { createInterface } = await import('readline');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>(resolve => rl.question(
      `\n[CleanClaw] Incomplete task${existingState.currentTaskId} detected (last completed step: ${existingState.lastCompletedStep}). Resume? [y/n]: `,
      a => { rl.close(); resolve(a.trim()); }
    ));
    if (answer.toLowerCase() === 'y') {
      resumeFromStep = existingState.lastCompletedStep + 1;
      logger.info(`[CleanClaw] Resuming from step ${resumeFromStep}.`);
    }
  }

  const taskId = getNextTaskId(plansDir);
  const variant = 'A';

  // Apply root policy before any LLM calls or file operations
  await applyRootPolicy(activeRoot, logger, runtimeContext);

  let taskState = createTaskState({
    taskId: `task${taskId}`,
    projectRoot: activeRoot,
    taskSummary: taskDescription,
    approvalMode: routedConfig.approvalGranularity ?? 'per-change',
  });
  taskState = transitionTaskState(taskState, 'why_definition');
  if (workflowAnswers?.why.trim()) {
    taskState = approveWhy(taskState, workflowAnswers.why, workflowAnswers.why);
    appendApprovalRecord(activeRoot, taskState.taskId, {
      timestamp: new Date().toISOString(),
      state: 'why_definition',
      userText: workflowAnswers.why,
      subject: 'task why',
    });
    taskState = transitionTaskState(taskState, 'scope');
  }
  if (confirmedFiles && confirmedFiles.length > 0) {
    taskState = approveFiles(taskState, confirmedFiles);
  }
  saveTaskState(activeRoot, taskState);
  let scopeTree = createScopeTree({
    taskId: taskState.taskId,
    projectRoot: activeRoot,
    plannedReads: scannedFiles ?? [],
    plannedEdits: confirmedFiles ?? [],
  });
  saveScopeTree(activeRoot, scopeTree);

  // Phase 1 — Augment task description with ProjectMap context (opt-in)
  let enrichedDescription = taskDescription;
  if (routedConfig.projectMap?.enabled) {
    const mapResults = await queryProjectMap(taskDescription, activeRoot, routedConfig, undefined, undefined, logger);
    if (mapResults.length > 0) {
      const context = mapResults
        .map(r => 'method_name' in r
          ? `- ${r.method_name}(${r.signature ?? ''}) in ${r.full_path ?? r.filename}`
          : `- ${r.filename} (${r.purpose ?? r.related_layer ?? ''})`)
        .join('\n');
      enrichedDescription = `${taskDescription}\n\nRelevant codebase context from ProjectMap:\n${context}`;
    }
  }

  // Phase 1 — Generate and write plan
  const { planPath, planContent } = await boss.run(enrichedDescription, taskId, variant);
  const completedPlanPath = planPath.replace('_plan.md', '_plan_completed.md');

  // Phase 1b — Write session header log
  if (workflowAnswers) {
    const { appendSessionHeader } = await import('../plans/log-writer.js');
    appendSessionHeader(
      `task${taskId}`,
      taskDescription,
      workflowAnswers,
      scannedFiles ?? [],
      confirmedFiles ?? [],
      planContent,
      plansDir,
      runtimeContext,
    );
  } else if (runtimeContext) {
    const { appendRuntimeContextHeader } = await import('../plans/log-writer.js');
    appendRuntimeContextHeader(`task${taskId}`, runtimeContext, plansDir);
  }

  // Phase 2 — Parse steps
  const steps = parseTaskPlanSteps(planContent);

  // Plan review — show plan content and ask to confirm before executing
  logger.info('\n─────────────────────────────────────────');
  logger.info('WORKSPACE SCOPE');
  logger.info('-----------------------------------------');
  logger.info(formatScopeTree(scopeTree));
  logger.info('-----------------------------------------');
  logger.info('');
  logger.info('GENERATED PLAN');
  logger.info('─────────────────────────────────────────');
  logger.info(planContent);
  logger.info('─────────────────────────────────────────');
  logger.info(`Plan written: ${planPath}`);
  logger.info(`Steps to execute: ${steps.length}`);
  logger.info('─────────────────────────────────────────\n');

  if (steps.length === 0) {
    logger.info('[CleanClaw] No executable steps found. Review the plan manually.');
    return;
  }

  if (!headless) {
    const { createInterface } = await import('readline');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const proceed = await new Promise<string>(resolve => {
      rl.question('Proceed with these steps? [y/n]: ', answer => { rl.close(); resolve(answer.trim()); });
    });
    if (proceed.toLowerCase() !== 'y') {
      logger.info('[CleanClaw] Task cancelled. Plan saved to:', planPath);
      return;
    }
  } else {
    logger.info('[headless] Skipping plan review — proceeding automatically.');
  }

  // Phase 3 — Execute with configured granularity
  const granularity = routedConfig.approvalGranularity ?? 'per-change';

  // ApprovedPlanContext built once here — pipeline and scope guard share the same reference
  const scopeCtx: ApprovedPlanContext = {
    approvedFiles: steps.map(s => s.body.match(/[\w./\\-]+\.\w+/g)?.[0] ?? '').filter(Boolean),
    taskDescription,
    planContent,
  };

  if (granularity === 'per-file') {
    await runPipelinePerFile(steps, taskId, variant, planPath, completedPlanPath, plansDir, routedConfig, languageAgent, bridge, logger);
  } else {
    scopeTree = await runPipelinePerChange(steps, taskId, variant, planPath, completedPlanPath, plansDir, routedConfig, languageAgent, bridge, scopeCtx, activeRoot, resumeFromStep, headless, logger, runtimeContextSummary, scopeTree);

    // Iteration loop — boss prompts for next iteration after each pipeline run
    let iterationNumber = 1;
    let currentPlanContent = planContent;
    let completedSteps = steps.map(s => s.body);

    while (true) {
      const iterResult = await boss.promptNextIteration(
        taskId, variant, currentPlanContent, taskDescription,
        completedSteps, scopeCtx, bridge, iterationNumber,
      );
      if (!iterResult) break;

      const iterSteps = parseTaskPlanSteps(iterResult.planContent);
      const iterCompletedPath = iterResult.planPath.replace('_plan.md', '_plan_completed.md');
      scopeTree = await runPipelinePerChange(iterSteps, taskId, variant, iterResult.planPath, iterCompletedPath, plansDir, routedConfig, languageAgent, bridge, scopeCtx, activeRoot, 0, false, logger, runtimeContextSummary, scopeTree);

      completedSteps = [...completedSteps, ...iterSteps.map(s => s.body)];
      currentPlanContent = iterResult.planContent;
      iterationNumber++;
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function printSummary(
  taskId: string,
  variant: string,
  changeNumber: number,
  plansDir: string,
  logger: CleanClawLogger,
): void {
  logger.info('\n─────────────────────────────────────────');
  logger.info(`[CleanClaw] Task ${taskId}${variant} complete. ${changeNumber - 1} change(s) processed.`);
  logger.info(`Log: ${path.join(plansDir, `task${taskId}`, `task${taskId}${variant}_log.md`)}`);
  logger.info('─────────────────────────────────────────');
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
  const logger = createConsoleLogger();
  const taskDescription = process.argv[2];
  if (!taskDescription) {
    logger.error('Usage: npx tsx cleanclaw/core/pipeline.ts "Your task description"');
    process.exit(1);
  }
  const config = getConfig();
  runPipeline(taskDescription, config, undefined, undefined, undefined, false, { logger }).catch(err => {
    logger.error('[CleanClaw] Pipeline failed:', err.message);
    process.exit(1);
  });
}
