import { describe, expect, it } from 'vitest';
import {
  approveCommand,
  approveBroaderApproval,
  approveFiles,
  approveFirstEdit,
  approvePlan,
  approveWhy,
  assertCanCommit,
  assertCanEditFile,
  assertFirstEditApproved,
  assertPlanApproved,
  assertCanRunCommand,
  assertCanTransition,
  assertCanUseFrontierModel,
  assertCanReadFile,
  assertCanPush,
  assertTaskStateAllowsEdit,
  assertWhyAligned,
  cancelTask,
  createTaskState,
  expireBroaderApproval,
  formatBlockedWorkSummary,
  markTaskBlocked,
  recordUserApproval,
  requestTaskRevision,
  transitionTaskState,
} from './control-contract.js';

describe('CleanClaw control contract', () => {
  it('defaults to per-change approval', () => {
    const state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });

    expect(state.approvalMode).toBe('per-change');
    expect(state.modelPolicy.mode).toBe('local_first');
  });

  it('cannot leave intake without a task summary', () => {
    const state = createTaskState({ taskId: 'task-1', projectRoot: '/repo' });

    expect(() => assertCanTransition(state, 'why_definition')).toThrow(/task summary/i);
  });

  it('requires an approved why before scope', () => {
    const state = transitionTaskState(
      createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' }),
      'why_definition',
    );

    expect(() => transitionTaskState(state, 'scope')).toThrow(/why/i);
  });

  it('allows scope after the user approves why', () => {
    const state = transitionTaskState(
      createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' }),
      'why_definition',
    );
    const withWhy = approveWhy(state, 'Keep the project controlled.', 'yes that is the why');

    expect(transitionTaskState(withWhy, 'scope').state).toBe('scope');
  });

  it('blocks execution without approved file scope', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    state = approveWhy(state, 'Keep the project controlled.', 'approved');
    state = { ...state, state: 'file_scope_approval' };

    expect(() => transitionTaskState(state, 'execution')).toThrow(/file scope/i);
  });

  it('allows editing only approved files inside the project root', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    state = approveWhy(state, 'Keep the project controlled.', 'approved');
    state = approvePlan(state, 'plans/task1.md', 'approve plan');
    state = approveFiles(state, ['src/index.ts']);
    state = { ...state, state: 'execution' };
    state = approveFirstEdit(state, 'approve first edit');

    expect(() => assertCanEditFile(state, '/repo/src/index.ts')).not.toThrow();
    expect(() => assertCanEditFile(state, '/repo/src/other.ts')).toThrow(/unapproved file/i);
    expect(() => assertCanEditFile(state, '/tmp/other.ts')).toThrow(/outside project root/i);
  });

  it('blocks edits while the task is still in planning states', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    state = approveWhy(state, 'Keep the project controlled.', 'approved');
    state = approvePlan(state, 'plans/task1.md', 'approve plan');
    state = approveFiles(state, ['src/index.ts']);
    state = { ...state, state: 'plan' };

    expect(() => assertTaskStateAllowsEdit(state)).toThrow(/execution/i);
    expect(() => assertCanEditFile(state, '/repo/src/index.ts')).toThrow(/execution/i);
    expect(() => assertTaskStateAllowsEdit({ ...state, state: 'execution' })).not.toThrow();
    expect(() => assertTaskStateAllowsEdit({ ...state, state: 'review_diff' })).not.toThrow();
  });

  it('requires explicit first-edit approval before editing approved files', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    state = approveWhy(state, 'Keep the project controlled.', 'approved');
    state = approveFiles(state, ['src/index.ts']);
    state = { ...state, state: 'execution' };

    expect(() => assertPlanApproved(state)).toThrow(/approved plan/i);
    state = approvePlan(state, 'plans/task1.md', 'approve plan', '2026-05-20T00:00:00.000Z');
    expect(state.approvedPlan).toEqual({
      timestamp: '2026-05-20T00:00:00.000Z',
      state: 'execution',
      userText: 'approve plan',
      subject: 'plan approval',
      planPath: 'plans/task1.md',
    });
    expect(() => assertPlanApproved(state)).not.toThrow();
    expect(() => assertFirstEditApproved(state)).toThrow(/first file edit/i);
    expect(() => assertCanEditFile(state, '/repo/src/index.ts')).toThrow(/first file edit/i);

    const approved = approveFirstEdit(state, 'approve first edit', undefined, '2026-05-19T00:00:00.000Z');
    expect(approved.firstEditApproval).toEqual({
      timestamp: '2026-05-19T00:00:00.000Z',
      state: 'execution',
      userText: 'approve first edit',
      subject: 'first file edit',
    });
    expect(() => assertFirstEditApproved(approved)).not.toThrow();
  });

  it('can apply saved approval granularity only after first edit approval', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    state = { ...state, approvalMode: 'per-change', state: 'execution' };

    const approved = approveFirstEdit(state, 'approve first edit and use file approvals', 'per-file');

    expect(approved.approvalMode).toBe('per-file');
    expect(approved.firstEditApproval?.userText).toBe('approve first edit and use file approvals');
  });

  it('records broader approval only with explicit user text', () => {
    const state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });

    expect(() => approveBroaderApproval(state, 'per-file', '')).toThrow(/approval text/i);

    const approved = approveBroaderApproval(
      state,
      'per-file',
      'I want to approve file changes for this task',
      '2026-05-19T00:00:00.000Z',
    );

    expect(approved.approvalMode).toBe('per-file');
    expect(approved.broaderApproval).toEqual({
      timestamp: '2026-05-19T00:00:00.000Z',
      state: 'intake',
      userText: 'I want to approve file changes for this task',
      subject: 'broader approval: per-file',
      mode: 'per-file',
      expiresAtTaskEnd: true,
    });
  });

  it('expires broader approval at task completion', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    state = approveBroaderApproval(state, 'per-step', 'approve steps for this task');

    const expired = expireBroaderApproval(state);
    expect(expired.approvalMode).toBe('per-change');
    expect(expired.broaderApproval).toBeUndefined();

    const doneState = transitionTaskState({ ...state, state: 'changelog' }, 'done');
    expect(doneState.approvalMode).toBe('per-change');
    expect(doneState.broaderApproval).toBeUndefined();
  });

  it('cancels an active task with explicit user text', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    state = approveBroaderApproval({ ...state, state: 'plan' }, 'per-file', 'approve file changes for this task');

    const cancelled = cancelTask(state, 'stop this task', '2026-05-20T00:00:00.000Z');

    expect(cancelled.state).toBe('cancelled');
    expect(cancelled.approvalMode).toBe('per-change');
    expect(cancelled.broaderApproval).toBeUndefined();
    expect(cancelled.cancellation).toEqual({
      timestamp: '2026-05-20T00:00:00.000Z',
      state: 'plan',
      userText: 'stop this task',
      subject: 'task cancellation',
      finalState: 'cancelled',
    });
    expect(() => cancelTask(cancelled, 'cancel again')).toThrow(/cannot cancel/i);
  });

  it('moves an active task to revision and clears execution-only approvals', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    state = approveWhy(state, 'Keep the project controlled.', 'approved');
    state = approveFiles(state, ['src/index.ts']);
    state = approveCommand(state, 'npm test');
    state = approveFirstEdit({ ...state, state: 'execution' }, 'approve first edit');
    state = approveBroaderApproval(state, 'per-file', 'approve file changes for this task');

    const revision = requestTaskRevision(state, 'change the plan', '2026-05-20T00:00:00.000Z');

    expect(revision.state).toBe('revision');
    expect(revision.why).toEqual(state.why);
    expect(revision.approvedFiles).toEqual([]);
    expect(revision.approvedCommands).toEqual([]);
    expect(revision.firstEditApproval).toBeUndefined();
    expect(revision.broaderApproval).toBeUndefined();
    expect(revision.approvalMode).toBe('per-change');
    expect(revision.revision).toEqual({
      timestamp: '2026-05-20T00:00:00.000Z',
      state: 'execution',
      userText: 'change the plan',
      subject: 'task revision',
      previousState: 'execution',
    });
  });

  it('marks active work blocked and highlights the blocker', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    state = approveWhy(state, 'Keep the project controlled.', 'approved');
    state = approveFiles(state, ['src/index.ts']);
    state = approveCommand(state, 'npm test');
    state = approveFirstEdit({ ...state, state: 'execution' }, 'approve first edit');
    state = approveBroaderApproval(state, 'per-file', 'approve file changes for this task');

    const blocked = markTaskBlocked(state, {
      blocker: 'Jacob has not supplied designs.',
      userText: 'blocked by missing designs',
      requestedFrom: 'Jacob',
      timestamp: '2026-05-20T00:00:00.000Z',
    });

    expect(blocked.state).toBe('blocked');
    expect(blocked.approvalMode).toBe('per-change');
    expect(blocked.broaderApproval).toBeUndefined();
    expect(blocked.firstEditApproval).toBeUndefined();
    expect(blocked.approvedFiles).toEqual([]);
    expect(blocked.approvedCommands).toEqual([]);
    expect(blocked.blocker).toEqual({
      timestamp: '2026-05-20T00:00:00.000Z',
      state: 'execution',
      userText: 'blocked by missing designs',
      subject: 'task blocked',
      previousState: 'execution',
      blocker: 'Jacob has not supplied designs.',
      requestedFrom: 'Jacob',
    });
    expect(formatBlockedWorkSummary(blocked)).toContain('Blocked by: Jacob has not supplied designs.');
    expect(() => markTaskBlocked({ ...state, state: 'done' }, {
      blocker: 'done',
      userText: 'blocked',
    })).toThrow(/cannot block/i);
  });

  it('can revise or cancel blocked work', () => {
    const blocked = markTaskBlocked(
      { ...createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' }), state: 'plan' },
      { blocker: 'Need client input.', userText: 'blocked' },
    );

    expect(requestTaskRevision(blocked, 'revise around blocker').state).toBe('revision');
    expect(cancelTask(blocked, 'cancel blocked task').state).toBe('cancelled');
  });

  it('allows reads inside root and blocks outside-root reads', () => {
    const state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });

    expect(() => assertCanReadFile(state, '/repo/package.json')).not.toThrow();
    expect(() => assertCanReadFile(state, '/tmp/package.json')).toThrow(/outside the project root/i);
  });

  it('requires approval for validation and git commands', () => {
    let state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });

    expect(() => assertCanRunCommand(state, 'npm test', 'validation')).toThrow(/requires explicit approval/i);
    state = approveCommand(state, 'npm test');
    expect(() => assertCanRunCommand(state, 'npm test', 'validation')).not.toThrow();

    expect(() => assertCanCommit(state)).toThrow(/git commit/i);
    expect(() => assertCanPush(state)).toThrow(/git push/i);
  });

  it('requires approval for frontier model use', () => {
    const state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });

    expect(() => assertCanUseFrontierModel(state, 'review-risky-change')).toThrow(/frontier model/i);
    expect(() => assertCanUseFrontierModel({
      ...state,
      modelPolicy: {
        ...state.modelPolicy,
        frontierApprovedFor: ['review-risky-change'],
      },
    }, 'review-risky-change')).not.toThrow();
  });

  it('blocks frontier model use for a purpose not in the approved list', () => {
    const state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    const withApproval = {
      ...state,
      modelPolicy: {
        ...state.modelPolicy,
        frontierApprovedFor: ['review-risky-change'],
      },
    };

    expect(() => assertCanUseFrontierModel(withApproval, 'headless-execution')).toThrow(/frontier model/i);
  });

  it('allows frontier model use only for the exact approved purpose', () => {
    const state = createTaskState({ taskId: 'task-1', projectRoot: '/repo', taskSummary: 'Do a thing' });
    const withApproval = {
      ...state,
      modelPolicy: {
        ...state.modelPolicy,
        frontierApprovedFor: ['headless-execution'],
      },
    };

    expect(() => assertCanUseFrontierModel(withApproval, 'headless-execution')).not.toThrow();
    expect(() => assertCanUseFrontierModel(withApproval, 'review-risky-change')).toThrow(/frontier model/i);
  });

  it('blocks unclear and misaligned why checks', () => {
    expect(() => assertWhyAligned('aligned', 'edit file')).not.toThrow();
    expect(() => assertWhyAligned('unclear', 'edit file')).toThrow(/unclear/i);
    expect(() => assertWhyAligned('misaligned', 'edit file')).toThrow(/misaligned/i);
  });

  it('records user approval text', () => {
    expect(recordUserApproval({
      state: 'file_scope_approval',
      userText: 'approve setup-wizard only',
      timestamp: '2026-05-13T00:00:00.000Z',
    })).toEqual({
      timestamp: '2026-05-13T00:00:00.000Z',
      state: 'file_scope_approval',
      userText: 'approve setup-wizard only',
      subject: undefined,
    });
  });
});
