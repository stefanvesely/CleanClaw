import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  approveFiles,
  approveWhy,
  createTaskState,
  recordUserApproval,
  recordWhyAlignment,
} from './control-contract.js';
import {
  appendApprovalRecord,
  appendWhyAlignmentRecord,
  loadApprovalRecords,
  loadTaskState,
  loadWhyAlignmentRecords,
  saveTaskState,
  taskRecordDir,
} from './task-records.js';

describe('CleanClaw task records', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-task-records-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('stores task state under the project-local .cleanclaw task directory', () => {
    const state = approveFiles(
      approveWhy(
        createTaskState({
          taskId: 'task-1',
          projectRoot: tmpDir,
          taskSummary: 'Add controlled task records',
        }),
        'Keep task control records in the repo.',
        'yes',
      ),
      ['cleanclaw/core/task-records.ts'],
    );

    const statePath = saveTaskState(tmpDir, state);

    expect(statePath).toBe(path.join(tmpDir, '.cleanclaw', 'tasks', 'task-1', 'state.json'));
    expect(loadTaskState(tmpDir, 'task-1')).toMatchObject({
      taskId: 'task-1',
      projectRoot: path.resolve(tmpDir),
      why: {
        text: 'Keep task control records in the repo.',
        approved: true,
      },
      approvedFiles: ['cleanclaw/core/task-records.ts'],
    });
  });

  it('returns null when task state has not been written', () => {
    expect(loadTaskState(tmpDir, 'missing-task')).toBeNull();
  });

  it('appends approval records as a project-local JSON array', () => {
    const record = recordUserApproval({
      state: 'file_scope_approval',
      userText: 'approve task-records only',
      timestamp: '2026-05-18T00:00:00.000Z',
    });

    const approvalPath = appendApprovalRecord(tmpDir, 'task-1', record);

    expect(approvalPath).toBe(path.join(taskRecordDir(tmpDir, 'task-1'), 'approval-records.json'));
    expect(loadApprovalRecords(tmpDir, 'task-1')).toEqual([record]);
  });

  it('appends why-alignment records as a project-local JSON array', () => {
    const record = recordWhyAlignment({
      state: 'execution',
      result: 'aligned',
      action: 'edit task-records.ts',
      rationale: 'The edit adds project-local task records.',
      timestamp: '2026-05-18T00:00:00.000Z',
    });

    const alignmentPath = appendWhyAlignmentRecord(tmpDir, 'task-1', record);

    expect(alignmentPath).toBe(path.join(taskRecordDir(tmpDir, 'task-1'), 'why-alignment-records.json'));
    expect(loadWhyAlignmentRecords(tmpDir, 'task-1')).toEqual([record]);
  });
});
