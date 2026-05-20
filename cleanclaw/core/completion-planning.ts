import type { CleanClawTaskState } from './control-contract.js';
import { transitionTaskState } from './control-contract.js';

export interface ReturnToPlanningSummary {
  completedTaskId: string;
  completedTaskSummary: string;
  completedState: CleanClawTaskState;
  nextMode: 'planning';
  prompt: string;
}

export function completeTaskAndReturnToPlanning(state: CleanClawTaskState): ReturnToPlanningSummary {
  const completedState = state.state === 'done' ? state : transitionTaskState(state, 'done');

  return {
    completedTaskId: completedState.taskId,
    completedTaskSummary: completedState.taskSummary ?? 'not recorded',
    completedState,
    nextMode: 'planning',
    prompt: 'Task complete. Return to planning mode and ask what the user wants to do next.',
  };
}

export function formatReturnToPlanningSummary(summary: ReturnToPlanningSummary): string {
  return [
    'Task complete.',
    `Task: ${summary.completedTaskId}`,
    `Summary: ${summary.completedTaskSummary}`,
    `Next mode: ${summary.nextMode}`,
    summary.prompt,
  ].join('\n');
}
