import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { CleanClawTaskState } from './control-contract.js';
import { assertCanRunCommand } from './control-contract.js';
import { ensureTaskRecordDir } from './task-records.js';

const VALIDATION_JSON_FILE = 'validation-records.json';
const VALIDATION_MARKDOWN_FILE = 'validation.md';

export interface ValidationCommandResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface ValidationRunRecord {
  timestamp: string;
  taskId: string;
  projectRoot: string;
  status: 'passed' | 'failed' | 'skipped';
  results: ValidationCommandResult[];
  summary: string;
}

export interface ValidationFailureReport {
  blocked: boolean;
  nextState: 'planning-update' | 'continue';
  failedCommands: string[];
  message: string;
}

export type ValidationCommandRunner = (command: string, cwd: string) => ValidationCommandResult;

export function runPlannedValidation(input: {
  state: CleanClawTaskState;
  commands: string[];
  runner?: ValidationCommandRunner;
  timestamp?: string;
}): ValidationRunRecord {
  const commands = unique(input.commands);
  const timestamp = input.timestamp ?? new Date().toISOString();

  for (const command of commands) {
    assertCanRunCommand(input.state, command, 'validation');
  }

  if (commands.length === 0) {
    const record = {
      timestamp,
      taskId: input.state.taskId,
      projectRoot: input.state.projectRoot,
      status: 'skipped' as const,
      results: [],
      summary: 'No planned validation commands were provided.',
    };
    saveValidationRecord(input.state.projectRoot, input.state.taskId, record);
    return record;
  }

  const runner = input.runner ?? runCommand;
  const results = commands.map((command) => runner(command, input.state.projectRoot));
  const failed = results.filter((result) => result.exitCode !== 0);
  const record: ValidationRunRecord = {
    timestamp,
    taskId: input.state.taskId,
    projectRoot: input.state.projectRoot,
    status: failed.length === 0 ? 'passed' : 'failed',
    results,
    summary: formatValidationSummary(results),
  };

  saveValidationRecord(input.state.projectRoot, input.state.taskId, record);
  return record;
}

export function saveValidationRecord(
  projectRoot: string,
  taskId: string,
  record: ValidationRunRecord,
): { jsonPath: string; markdownPath: string } {
  const dir = ensureTaskRecordDir(projectRoot, taskId);
  const jsonPath = path.join(dir, VALIDATION_JSON_FILE);
  const markdownPath = path.join(dir, VALIDATION_MARKDOWN_FILE);
  const records = loadValidationRecords(projectRoot, taskId);
  records.push(record);

  fs.writeFileSync(jsonPath, `${JSON.stringify(records, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(markdownPath, formatValidationRecordsMarkdown(records), 'utf-8');

  return { jsonPath, markdownPath };
}

export function loadValidationRecords(projectRoot: string, taskId: string): ValidationRunRecord[] {
  const filepath = path.join(ensureTaskRecordDir(projectRoot, taskId), VALIDATION_JSON_FILE);
  if (!fs.existsSync(filepath)) return [];
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as ValidationRunRecord[];
}

export function formatValidationSummary(results: ValidationCommandResult[]): string {
  if (results.length === 0) return 'No validation commands ran.';
  const passed = results.filter((result) => result.exitCode === 0).length;
  const failed = results.length - passed;
  return `Validation ${failed === 0 ? 'passed' : 'failed'}: ${passed} passed, ${failed} failed.`;
}

export function createValidationFailureReport(record: ValidationRunRecord): ValidationFailureReport {
  const failedCommands = record.results
    .filter((result) => result.exitCode !== 0)
    .map((result) => result.command);

  if (record.status !== 'failed') {
    return {
      blocked: false,
      nextState: 'continue',
      failedCommands: [],
      message: `Validation status is ${record.status}. No validation failure is blocking the task.`,
    };
  }

  return {
    blocked: true,
    nextState: 'planning-update',
    failedCommands,
    message: [
      'Validation failed.',
      `Failed commands: ${failedCommands.join(', ') || 'unknown'}.`,
      'Return to planning/update mode, propose a fix, and ask whether to update the plan.',
    ].join(' '),
  };
}

export function formatValidationFailureReport(report: ValidationFailureReport): string {
  if (!report.blocked) return report.message;

  return [
    'Validation failed.',
    'Blocked: yes',
    `Next state: ${report.nextState}`,
    'Failed commands:',
    ...report.failedCommands.map((command) => `- ${command}`),
    'Required action: propose a fix/update plan and ask whether to update the plan.',
  ].join('\n');
}

function formatValidationRecordsMarkdown(records: ValidationRunRecord[]): string {
  return [
    '# Validation Records',
    '',
    ...records.flatMap((record) => [
      `## ${record.timestamp}`,
      '',
      `Status: ${record.status}`,
      `Summary: ${record.summary}`,
      '',
      ...record.results.flatMap((result) => [
        `- Command: ${result.command}`,
        `  - Exit code: ${result.exitCode}`,
        `  - Duration: ${result.durationMs}ms`,
      ]),
      record.results.length === 0 ? '- No commands ran.' : '',
      '',
    ]),
  ].join('\n');
}

function runCommand(command: string, cwd: string): ValidationCommandResult {
  const started = Date.now();
  const result = spawnSync(command, {
    cwd,
    shell: true,
    encoding: 'utf-8',
  });

  return {
    command,
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? result.error?.message ?? '',
    durationMs: Date.now() - started,
  };
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}
