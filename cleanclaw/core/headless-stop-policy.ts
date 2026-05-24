import { createHeadlessBlockReport, type HeadlessBlockReport } from './headless-block-report.js';

export type HeadlessStopCategory =
  | 'approved-plan'
  | 'scope'
  | 'why'
  | 'model-policy'
  | 'validation-policy'
  | 'runtime-policy';

export interface HeadlessStopPolicyInput {
  taskId: string;
  stepId: string;
  category: HeadlessStopCategory;
  detail: string;
  createdAt?: string;
}

export function createHeadlessStopReport(input: HeadlessStopPolicyInput): HeadlessBlockReport {
  return createHeadlessBlockReport({
    taskId: input.taskId,
    stepId: input.stepId,
    blocker: `${labelCategory(input.category)} violation`,
    whyItStopped: input.detail,
    allowedNextActions: [
      'Review the blocker',
      'Revise the plan',
      'Approve a bounded scope or policy update',
      'Cancel the task',
    ],
    createdAt: input.createdAt,
  });
}

function labelCategory(category: HeadlessStopCategory): string {
  return category
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
