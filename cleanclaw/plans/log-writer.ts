import fs from 'fs';
import path from 'path';
import type { ProposedChange } from '../core/language-agent.js';
import type { DiffCapture } from './diff-capture.js';

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
    : before.lines.map(l => `  ${l.lineNumber}: ${l.content}`).join('\n');

  const afterContent = proposed.afterLines
    .map(l => `  ${l.lineNumber}: ${l.content}`)
    .join('\n');

  return [
    `## Change ${changeNumber}`,
    `**File:** ${proposed.filename}${before.isNewFile ? ' *(new file)*' : ''}`,
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
    `**Why:** ${why}`,
    `**Model:** ${model}`,
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
    filename: proposed.filename,
    isNewFile: before.isNewFile,
    before: before.lines,
    after: proposed.afterLines,
    explanation: proposed.explanation,
    why,
    model,
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
