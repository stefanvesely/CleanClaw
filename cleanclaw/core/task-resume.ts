import type { CleanClawTaskState } from './control-contract.js';
import { listTaskRecordSummaries, type TaskRecordSummary } from './task-records.js';

export interface TaskResumeSummary {
  taskId: string;
  state: CleanClawTaskState;
  statePath: string;
  scopeTreePath: string | null;
  canResume: boolean;
  reason: string;
}

const TERMINAL_STATES = new Set(['done', 'cancelled']);

export function isTaskStateResumable(state: CleanClawTaskState): boolean {
  return !TERMINAL_STATES.has(state.state);
}

export function latestResumableTaskState(projectRoot: string): TaskResumeSummary | null {
  const summaries = listTaskRecordSummaries(projectRoot)
    .filter((summary) => summary.state && summary.statePath)
    .reverse();

  for (const summary of summaries) {
    const resume = toTaskResumeSummary(summary);
    if (resume?.canResume) return resume;
  }

  return null;
}

export function toTaskResumeSummary(summary: TaskRecordSummary): TaskResumeSummary | null {
  if (!summary.state || !summary.statePath) return null;
  const canResume = isTaskStateResumable(summary.state);

  return {
    taskId: summary.taskId,
    state: summary.state,
    statePath: summary.statePath,
    scopeTreePath: summary.scopeTreePath,
    canResume,
    reason: canResume
      ? `Task is in ${summary.state.state} and can return to planning or continue from saved state.`
      : `Task is ${summary.state.state} and is terminal.`,
  };
}

export function formatTaskResumeSummary(summary: TaskResumeSummary): string {
  return [
    `Task: ${summary.taskId}`,
    `State: ${summary.state.state}`,
    `Summary: ${summary.state.taskSummary ?? 'not recorded'}`,
    `Why approved: ${summary.state.why?.approved ? 'yes' : 'no'}`,
    `State file: ${summary.statePath}`,
    `Scope tree: ${summary.scopeTreePath ?? 'not recorded'}`,
    `Can resume: ${summary.canResume ? 'yes' : 'no'}`,
    `Reason: ${summary.reason}`,
  ].join('\n');
}
