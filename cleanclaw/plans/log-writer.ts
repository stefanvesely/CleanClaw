import fs from 'fs';
import path from 'path';
import type { ProposedChange } from '../core/language-agent.js';
import type { DiffCapture } from './diff-capture.js';
import { redactLineContent, redactPlanSecrets } from './secret-redactor.js';
import { formatRuntimeContextMarkdown, type CleanClawRuntimeContext } from '../core/runtime-context.js';

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatLogEntryMarkdown(
  changeNumber: number,
  proposed: ProposedChange,
  before: DiffCapture,
  why: string,
  model: string,
): string {
  const beforeContent = before.isNewFile
    ? '(new file)'
    : before.lines.map(l => `  ${l.lineNumber}: ${redactPlanSecrets(l.content)}`).join('\n');

  const afterContent = proposed.afterLines
    .map(l => `  ${l.lineNumber}: ${redactPlanSecrets(l.content)}`)
    .join('\n');

  return [
    `## Change ${changeNumber}`,
    `**File:** ${redactPlanSecrets(proposed.filename)}${before.isNewFile ? ' *(new file)*' : ''}`,
    '',
    '**Before:**',
    '```',
    beforeContent,
    '```',
    '',
    '**After:**',
    '```',
    afterContent,
    '```',
    '',
    `**Why:** ${redactPlanSecrets(why)}`,
    `**Model:** ${redactPlanSecrets(model)}`,
    '',
    '---',
    '',
  ].join('\n');
}

function formatLogEntryJson(
  changeNumber: number,
  proposed: ProposedChange,
  before: DiffCapture,
  why: string,
  model: string,
): string {
  const entry = {
    changeNumber,
    filename: redactPlanSecrets(proposed.filename),
    isNewFile: before.isNewFile,
    before: before.lines.map(redactLineContent),
    after: proposed.afterLines.map(redactLineContent),
    explanation: redactPlanSecrets(proposed.explanation),
    why: redactPlanSecrets(why),
    model: redactPlanSecrets(model),
    timestamp: new Date().toISOString(),
  };
  return JSON.stringify(entry) + '\n';
}

// ─── Append ───────────────────────────────────────────────────────────────────

export function appendLogEntry(
  taskId: string,
  variant: string,
  changeNumber: number,
  proposed: ProposedChange,
  before: DiffCapture,
  why: string,
  model: string,
  plansDir: string,
  logFormat: 'markdown' | 'json',
): void {
  const dir = path.join(plansDir, `task${taskId}`);
  const ext = logFormat === 'json' ? 'json' : 'md';
  const filepath = path.join(dir, `task${taskId}${variant}_log.${ext}`);

  const entry = logFormat === 'json'
    ? formatLogEntryJson(changeNumber, proposed, before, why, model)
    : formatLogEntryMarkdown(changeNumber, proposed, before, why, model);

  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(filepath, entry, 'utf-8');
}

// ─── Session Header ───────────────────────────────────────────────────────────

export function appendSessionHeader(
  taskId: string,
  taskDescription: string,
  answers: { why: string; files: string; criteria: string; outOfScope: string },
  scannedFiles: string[],
  confirmedFiles: string[],
  planContent: string,
  plansDir: string,
  runtimeContext?: CleanClawRuntimeContext | null,
): void {
  const dir = path.join(plansDir, taskId);
  const filepath = path.join(dir, 'task.log');

  const confirmedList = confirmedFiles.map(f => `- ${f}`).join('\n');

  const block = [
    `# Session — ${new Date().toISOString()}`,
    '',
    '## Task',
    redactPlanSecrets(taskDescription),
    '',
    '## Clarification',
    `- Why: ${redactPlanSecrets(answers.why)}`,
    `- Files specified: ${redactPlanSecrets(answers.files)}`,
    `- Acceptance criteria: ${redactPlanSecrets(answers.criteria)}`,
    `- Out of scope: ${redactPlanSecrets(answers.outOfScope)}`,
    '',
    '## File Scan',
    `Scanned: ${scannedFiles.length} files`,
    'Confirmed:',
    redactPlanSecrets(confirmedList),
    '',
    formatRuntimeContextMarkdown(runtimeContext),
    runtimeContext ? '' : undefined,
    '## Plan',
    redactPlanSecrets(planContent),
    '',
    '---',
    '',
  ].filter((line): line is string => line !== undefined).join('\n');

  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(filepath, block, 'utf-8');
}

export function appendRuntimeContextHeader(
  taskId: string,
  runtimeContext: CleanClawRuntimeContext,
  plansDir: string,
): void {
  const dir = path.join(plansDir, taskId);
  const filepath = path.join(dir, 'task.log');
  const block = [
    `# Runtime Context - ${new Date().toISOString()}`,
    '',
    formatRuntimeContextMarkdown(runtimeContext),
    '',
    '---',
    '',
  ].join('\n');

  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(filepath, redactPlanSecrets(block), 'utf-8');
}

// ─── Rollback ─────────────────────────────────────────────────────────────────

export function appendRollbackEntry(
  taskId: string,
  variant: string,
  restoredFiles: string[],
  plansDir: string,
  logFormat: 'markdown' | 'json',
): void {
  const dir = path.join(plansDir, `task${taskId}`);
  const ext = logFormat === 'json' ? 'json' : 'md';
  const filepath = path.join(dir, `task${taskId}${variant}_log.${ext}`);

  const timestamp = new Date().toISOString();

  const entry = logFormat === 'json'
    ? JSON.stringify({ type: 'rollback', taskId, restoredFiles: restoredFiles.map(redactPlanSecrets), timestamp }) + '\n'
    : [
        `## Rollback`,
        `**Task:** task${taskId}${variant}`,
        `**Timestamp:** ${timestamp}`,
        `**Restored files:**`,
        restoredFiles.map(f => `- ${redactPlanSecrets(f)}`).join('\n'),
        '',
        '---',
        '',
      ].join('\n');

  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(filepath, entry, 'utf-8');
}
