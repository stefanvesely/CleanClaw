export interface HeadlessBlockReport {
  taskId: string;
  stepId: string;
  blocker: string;
  whyItStopped: string;
  allowedNextActions: string[];
  createdAt: string;
}

export function createHeadlessBlockReport(input: Omit<HeadlessBlockReport, 'createdAt'> & {
  createdAt?: string;
}): HeadlessBlockReport {
  return {
    taskId: input.taskId,
    stepId: input.stepId,
    blocker: input.blocker,
    whyItStopped: input.whyItStopped,
    allowedNextActions: [...input.allowedNextActions],
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function formatHeadlessBlockReport(report: HeadlessBlockReport): string {
  return [
    '# Headless Execution Blocked',
    '',
    `Created: ${report.createdAt}`,
    `Task ID: ${report.taskId}`,
    `Step ID: ${report.stepId}`,
    '',
    '## Blocker',
    '',
    `BLOCKED: ${report.blocker}`,
    '',
    '## Why It Stopped',
    '',
    report.whyItStopped,
    '',
    '## What Should CleanClaw Do Next?',
    '',
    ...report.allowedNextActions.map((action, index) => `${index + 1}. ${action}`),
  ].join('\n');
}
