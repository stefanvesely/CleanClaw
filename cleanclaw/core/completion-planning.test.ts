import { describe, expect, it } from 'vitest';
import { approveBroaderApproval, createTaskState } from './control-contract.js';
import {
  completeTaskAndReturnToPlanning,
  formatReturnToPlanningSummary,
} from './completion-planning.js';

describe('completion planning', () => {
  it('completes a task and returns a planning summary', () => {
    let state = createTaskState({ taskId: 'task1', projectRoot: '/repo', taskSummary: 'Fix login cache' });
    state = approveBroaderApproval({ ...state, state: 'changelog' }, 'per-file', 'approve files for task');

    const summary = completeTaskAndReturnToPlanning(state);

    expect(summary.completedState.state).toBe('done');
    expect(summary.completedState.approvalMode).toBe('per-change');
    expect(summary.completedState.broaderApproval).toBeUndefined();
    expect(summary.nextMode).toBe('planning');
    expect(formatReturnToPlanningSummary(summary)).toContain('Return to planning mode');
  });

  it('formats an already completed task without changing the next mode', () => {
    const state = {
      ...createTaskState({ taskId: 'task1', projectRoot: '/repo', taskSummary: 'Already done' }),
      state: 'done' as const,
    };

    const summary = completeTaskAndReturnToPlanning(state);

    expect(summary.completedState).toEqual(state);
    expect(summary.nextMode).toBe('planning');
  });
});
