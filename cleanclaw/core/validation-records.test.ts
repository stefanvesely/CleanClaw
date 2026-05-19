import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { approveCommand, createTaskState } from './control-contract.js';
import {
  formatValidationSummary,
  loadValidationRecords,
  runPlannedValidation,
} from './validation-records.js';

describe('validation records', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-validation-records-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('refuses to run unapproved validation commands', () => {
    const state = createTaskState({ taskId: 'task1', projectRoot: tmpDir, taskSummary: 'Validate' });

    expect(() => runPlannedValidation({
      state,
      commands: ['npm test'],
      runner: fakeRunner(0),
    })).toThrow(/requires explicit approval/i);
  });

  it('runs approved validation commands and records results', () => {
    let state = createTaskState({ taskId: 'task1', projectRoot: tmpDir, taskSummary: 'Validate' });
    state = approveCommand(state, 'npm test');

    const record = runPlannedValidation({
      state,
      commands: ['npm test'],
      runner: fakeRunner(0),
      timestamp: '2026-05-19T00:00:00.000Z',
    });

    expect(record.status).toBe('passed');
    expect(record.summary).toBe('Validation passed: 1 passed, 0 failed.');
    expect(loadValidationRecords(tmpDir, 'task1')).toEqual([record]);
    expect(fs.readFileSync(path.join(tmpDir, '.cleanclaw', 'tasks', 'task1', 'validation.md'), 'utf-8'))
      .toContain('Status: passed');
  });

  it('records failed validation summaries', () => {
    let state = createTaskState({ taskId: 'task1', projectRoot: tmpDir, taskSummary: 'Validate' });
    state = approveCommand(state, 'npm test');

    const record = runPlannedValidation({
      state,
      commands: ['npm test'],
      runner: fakeRunner(1),
    });

    expect(record.status).toBe('failed');
    expect(record.summary).toBe('Validation failed: 0 passed, 1 failed.');
  });

  it('records skipped validation when there are no commands', () => {
    const state = createTaskState({ taskId: 'task1', projectRoot: tmpDir, taskSummary: 'Validate' });

    const record = runPlannedValidation({ state, commands: [] });

    expect(record.status).toBe('skipped');
    expect(record.summary).toBe('No planned validation commands were provided.');
  });

  it('formats empty validation summaries', () => {
    expect(formatValidationSummary([])).toBe('No validation commands ran.');
  });
});

function fakeRunner(exitCode: number) {
  return (command: string) => ({
    command,
    exitCode,
    stdout: exitCode === 0 ? 'ok' : '',
    stderr: exitCode === 0 ? '' : 'failed',
    durationMs: 12,
  });
}
