import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDraftSessionPlan } from './session-plan.js';

describe('session draft plan', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-session-plan-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates a project-local draft plan with control fields', () => {
    const filepath = createDraftSessionPlan({
      projectRoot: tmpDir,
      taskDescription: 'Fix login cache',
      taskWhy: {
        text: 'Keep login reliable',
        approved: true,
        approvedByUserText: 'Keep login reliable',
      },
      requester: 'Mali',
      beneficiary: 'Support users',
      taskId: 'task1',
      createdAt: '2026-05-19T00:00:00.000Z',
    });

    expect(filepath).toBe(path.join(tmpDir, 'plans', 'inprogress', '2026-05-19-fix-login-cache.md'));
    const content = fs.readFileSync(filepath, 'utf-8');
    expect(content).toContain('Status: draft');
    expect(content).toContain('Requester: Mali');
    expect(content).toContain('Beneficiary: Support users');
    expect(content).toContain('Task record: .cleanclaw/tasks/task1/state.json');
    expect(content).toContain('## What Needs Confirmation');
  });
});
