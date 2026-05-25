import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  evaluateHeadlessModelRolePolicy,
  recordHeadlessModelRolePolicy,
} from './headless-model-role-policy.js';
import { loadApprovalRecords, taskRecordDir } from './task-records.js';

describe('headless model role policy', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-model-role-policy-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('allows distinct coder and reviewer models without warning', () => {
    expect(evaluateHeadlessModelRolePolicy({
      coderModel: 'frontier-coder',
      reviewerModel: 'frontier-reviewer',
    })).toEqual({
      allowed: true,
      sameModel: false,
      warning: null,
      missing: [],
    });
  });

  it('requires explicit approval when coder and reviewer use the same model', () => {
    expect(evaluateHeadlessModelRolePolicy({
      coderModel: 'frontier-model',
      reviewerModel: 'frontier-model',
    })).toEqual({
      allowed: false,
      sameModel: true,
      warning: 'Coder and reviewer use the same model, so review independence is reduced.',
      missing: ['explicit same-model approval'],
    });
  });

  it('records same-model approval in model routing and approval records', () => {
    const result = recordHeadlessModelRolePolicy({
      projectRoot: tmpDir,
      taskId: 'task1',
      coderModel: 'frontier-model',
      reviewerModel: 'frontier-model',
      approvedSameModelUserText: 'I approve using the same model for this headless task.',
      recordedAt: '2026-05-25T00:00:00.000Z',
    });

    expect(result.decision.allowed).toBe(true);
    expect(result.modelRoutingPath).toBe(path.join(taskRecordDir(tmpDir, 'task1'), 'model-routing.md'));
    expect(fs.readFileSync(result.modelRoutingPath, 'utf-8')).toContain('review independence is reduced');
    expect(loadApprovalRecords(tmpDir, 'task1')).toEqual([
      {
        timestamp: '2026-05-25T00:00:00.000Z',
        state: 'plan_approval',
        userText: 'I approve using the same model for this headless task.',
        subject: 'same-model coder/reviewer approval',
      },
    ]);
  });
});
