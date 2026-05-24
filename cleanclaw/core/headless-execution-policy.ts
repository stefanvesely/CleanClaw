import { readPlanStatus } from './plan-status.js';

export interface HeadlessExecutionPolicyInput {
  planPath: string;
  optInUserText: string;
  coderRole: string;
  reviewerRole: string;
}

export interface HeadlessExecutionPolicyResult {
  allowed: boolean;
  missing: string[];
}

export function checkHeadlessExecutionPolicy(input: HeadlessExecutionPolicyInput): HeadlessExecutionPolicyResult {
  const missing: string[] = [];
  const planStatus = readPlanStatus(input.planPath);

  if (planStatus !== 'ready-for-execution') missing.push('ready-for-execution plan status');
  if (!input.optInUserText.trim()) missing.push('explicit headless opt-in');
  if (!input.coderRole.trim()) missing.push('coder role');
  if (!input.reviewerRole.trim()) missing.push('reviewer role');

  return {
    allowed: missing.length === 0,
    missing,
  };
}

export function assertHeadlessExecutionAllowed(input: HeadlessExecutionPolicyInput): void {
  const result = checkHeadlessExecutionPolicy(input);
  if (result.allowed) return;

  throw new Error(`Headless execution is not allowed. Missing: ${result.missing.join(', ')}.`);
}
