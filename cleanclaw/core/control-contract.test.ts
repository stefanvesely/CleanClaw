import { describe, expect, it } from 'vitest';
import {
  approveCommand,
  approveFiles,
  approveFirstEdit,
  approveWhy,
  assertCanCommit,
  assertCanEditFile,
  assertFirstEditApproved,
  assertCanRunCommand,
  assertCanTransition,
  assertCanUseFrontierModel,
  assertCanReadFile,
  assertCanPush,
  assertTaskStateAllowsEdit,
  assertWhyAligned,
  createTaskState,
  recordUserApproval,
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

    expect(() => assertFirstEditApproved(state)).toThrow(/first file edit/i);
    expect(() => assertCanEditFile(state, '/repo/src/index.ts')).toThrow(/first file edit/i);

    const approved = approveFirstEdit(state, 'approve first edit', '2026-05-19T00:00:00.000Z');
    expect(approved.firstEditApproval).toEqual({
      timestamp: '2026-05-19T00:00:00.000Z',
      state: 'execution',
      userText: 'approve first edit',
      subject: 'first file edit',
    });
    expect(() => assertFirstEditApproved(approved)).not.toThrow();
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
