import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTaskState } from './control-contract.js';
import { recordFrontierModelApproval } from './frontier-approval-record.js';
import { loadApprovalRecords, loadTaskState, taskRecordDir } from './task-records.js';

describe('frontier approval record', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-frontier-approval-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('records approved frontier use in task state, model routing, and approvals', () => {
    const state = createTaskState({
      taskId: 'task1',
      projectRoot: tmpDir,
      taskSummary: 'Review risky change',
    });

    const result = recordFrontierModelApproval({
      projectRoot: tmpDir,
      taskState: state,
      purpose: 'review-risky-change',
      model: 'frontier-reviewer',
      userText: 'Use frontier reviewer for this risky change.',
      approvedAt: '2026-05-25T00:10:00.000Z',
    });

    expect(result.taskState.modelPolicy).toMatchObject({
      mode: 'frontier_approved',
      frontierApprovedFor: ['review-risky-change'],
    });
    expect(loadTaskState(tmpDir, 'task1')?.modelPolicy.frontierApprovedFor).toEqual(['review-risky-change']);
    expect(result.modelRoutingPath).toBe(path.join(taskRecordDir(tmpDir, 'task1'), 'model-routing.md'));
    expect(fs.readFileSync(result.modelRoutingPath, 'utf-8')).toContain('frontier approved for exact recorded purpose');
    expect(loadApprovalRecords(tmpDir, 'task1')).toEqual([
      {
        timestamp: '2026-05-25T00:10:00.000Z',
        state: 'intake',
        userText: 'Use frontier reviewer for this risky change.',
        subject: 'frontier model approval: review-risky-change',
      },
    ]);
  });

  it('does not duplicate approved purposes', () => {
    const state = {
      ...createTaskState({
      taskId: 'task1',
      projectRoot: tmpDir,
      }),
      modelPolicy: {
        mode: 'frontier_approved' as const,
        frontierApprovedFor: ['review-risky-change'],
        headless: false,
      },
    };

    const result = recordFrontierModelApproval({
      projectRoot: tmpDir,
      taskState: state,
      purpose: 'review-risky-change',
      model: 'frontier-reviewer',
      userText: 'Approve again.',
    });

    expect(result.taskState.modelPolicy.frontierApprovedFor).toEqual(['review-risky-change']);
  });
});
