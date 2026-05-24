import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApprovedSessionPlan, createDraftSessionPlan } from './session-plan.js';

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
    expect(content).toContain('## Proposed Scope Why Alignment');
    expect(content).toContain('- none proposed yet');
    expect(content).toContain('## What Needs Confirmation');
  });

  it('includes why alignment for proposed scope items', () => {
    const filepath = createDraftSessionPlan({
      projectRoot: tmpDir,
      taskDescription: 'Fix login cache',
      taskWhy: {
        text: 'Keep login cache reliable',
        approved: true,
        approvedByUserText: 'yes',
      },
      requester: 'Mali',
      beneficiary: 'Support users',
      taskId: 'task1',
      plannedScopeItems: [
        {
          path: 'src/auth/login-cache.ts',
          kind: 'edit',
          rationale: 'Updates login cache reliability.',
        },
      ],
      createdAt: '2026-05-19T00:00:00.000Z',
    });

    expect(fs.readFileSync(filepath, 'utf-8')).toContain(
      '- src/auth/login-cache.ts (edit): aligned - Updates login cache reliability.',
    );
  });

  it('creates multiple approved plans without overwriting existing plans', () => {
    const input = {
      projectRoot: tmpDir,
      taskDescription: 'Fix login cache',
      taskWhy: {
        text: 'Keep login cache reliable',
        approved: true,
        approvedByUserText: 'yes',
      },
      requester: 'Mali',
      beneficiary: 'Support users',
      taskId: 'task1',
      createdAt: '2026-05-20T00:00:00.000Z',
    };

    const first = createApprovedSessionPlan(input);
    const second = createApprovedSessionPlan(input);

    expect(first).toBe(path.join(tmpDir, 'plans', 'inprogress', '2026-05-20-fix-login-cache.md'));
    expect(second).toBe(path.join(tmpDir, 'plans', 'inprogress', '2026-05-20-fix-login-cache-2.md'));
    expect(fs.readFileSync(first, 'utf-8')).toContain('Status: approved');
    expect(fs.readFileSync(second, 'utf-8')).toContain('Status: approved');
  });
});
