import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { approveWhy, cancelTask, createTaskState, transitionTaskState } from './control-contract.js';
import { saveTaskState } from './task-records.js';
import {
  formatTaskResumeSummary,
  isTaskStateResumable,
  latestResumableTaskState,
  toTaskResumeSummary,
} from './task-resume.js';

describe('task resume', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-task-resume-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('identifies resumable and terminal states', () => {
    expect(isTaskStateResumable(createTaskState({
      taskId: 'task1',
      projectRoot: tmpDir,
      taskSummary: 'Plan work',
    }))).toBe(true);

    expect(isTaskStateResumable({
      ...createTaskState({ taskId: 'task1', projectRoot: tmpDir, taskSummary: 'Done' }),
      state: 'done',
    })).toBe(false);
  });

  it('returns the latest non-terminal task state', () => {
    const cancelled = cancelTask(
      { ...createTaskState({ taskId: 'task1', projectRoot: tmpDir, taskSummary: 'Old work' }), state: 'plan' },
      'stop',
      '2026-05-20T00:00:00.000Z',
    );
    const resumable = approveWhy(
      { ...createTaskState({ taskId: 'task2', projectRoot: tmpDir, taskSummary: 'New work' }), state: 'why_definition' },
      'Keep control.',
      'yes',
    );

    saveTaskState(tmpDir, cancelled);
    saveTaskState(tmpDir, resumable);

    const summary = latestResumableTaskState(tmpDir);

    expect(summary?.taskId).toBe('task2');
    expect(summary?.canResume).toBe(true);
    expect(formatTaskResumeSummary(summary!)).toContain('Summary: New work');
  });

  it('explains terminal task states', () => {
    const done = transitionTaskState(
      { ...createTaskState({ taskId: 'task1', projectRoot: tmpDir, taskSummary: 'Done work' }), state: 'changelog' },
      'done',
    );
    saveTaskState(tmpDir, done);

    const statePath = path.join(tmpDir, '.cleanclaw', 'tasks', 'task1', 'state.json');
    const summary = toTaskResumeSummary({
      taskId: 'task1',
      directory: path.dirname(statePath),
      statePath,
      scopeTreePath: null,
      state: done,
    });

    expect(summary?.canResume).toBe(false);
    expect(summary?.reason).toContain('terminal');
  });
});
