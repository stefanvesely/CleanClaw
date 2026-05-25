import fs from 'fs';
import path from 'path';
import { appendApprovalRecord, ensureTaskRecordDir } from './task-records.js';

export interface HeadlessModelRolePolicyInput {
  coderModel: string;
  reviewerModel: string;
  approvedSameModelUserText?: string;
}

export interface HeadlessModelRolePolicyDecision {
  allowed: boolean;
  sameModel: boolean;
  warning: string | null;
  missing: string[];
}

export interface HeadlessModelRoleRecordInput extends HeadlessModelRolePolicyInput {
  projectRoot: string;
  taskId: string;
  recordedAt?: string;
}

const MODEL_ROUTING_FILE = 'model-routing.md';
const SAME_MODEL_WARNING = 'Coder and reviewer use the same model, so review independence is reduced.';

export function evaluateHeadlessModelRolePolicy(
  input: HeadlessModelRolePolicyInput,
): HeadlessModelRolePolicyDecision {
  const missing: string[] = [];
  const coderModel = input.coderModel.trim();
  const reviewerModel = input.reviewerModel.trim();
  const sameModel = Boolean(coderModel && reviewerModel && coderModel === reviewerModel);

  if (!coderModel) missing.push('coder model');
  if (!reviewerModel) missing.push('reviewer model');
  if (sameModel && !input.approvedSameModelUserText?.trim()) {
    missing.push('explicit same-model approval');
  }

  return {
    allowed: missing.length === 0,
    sameModel,
    warning: sameModel ? SAME_MODEL_WARNING : null,
    missing,
  };
}

export function recordHeadlessModelRolePolicy(input: HeadlessModelRoleRecordInput): {
  decision: HeadlessModelRolePolicyDecision;
  modelRoutingPath: string;
  approvalRecordsPath: string | null;
} {
  const decision = evaluateHeadlessModelRolePolicy(input);
  const dir = ensureTaskRecordDir(input.projectRoot, input.taskId);
  const modelRoutingPath = path.join(dir, MODEL_ROUTING_FILE);
  const recordedAt = input.recordedAt ?? new Date().toISOString();
  const section = formatModelRoutingSection(input, decision, recordedAt);

  fs.writeFileSync(modelRoutingPath, `${section}\n`, 'utf-8');

  const approvalRecordsPath = decision.sameModel && input.approvedSameModelUserText?.trim()
    ? appendApprovalRecord(input.projectRoot, input.taskId, {
      timestamp: recordedAt,
      state: 'plan_approval',
      userText: input.approvedSameModelUserText.trim(),
      subject: 'same-model coder/reviewer approval',
    })
    : null;

  return {
    decision,
    modelRoutingPath,
    approvalRecordsPath,
  };
}

function formatModelRoutingSection(
  input: HeadlessModelRoleRecordInput,
  decision: HeadlessModelRolePolicyDecision,
  recordedAt: string,
): string {
  return [
    '# Model Routing',
    '',
    `Recorded: ${recordedAt}`,
    '',
    `Coder model: ${input.coderModel.trim() || 'missing'}`,
    `Reviewer model: ${input.reviewerModel.trim() || 'missing'}`,
    `Same model: ${decision.sameModel ? 'yes' : 'no'}`,
    `Allowed: ${decision.allowed ? 'yes' : 'no'}`,
    '',
    'Warnings',
    decision.warning ? `- ${decision.warning}` : '- none',
    '',
    'Missing',
    ...formatList(decision.missing),
  ].join('\n');
}

function formatList(values: string[]): string[] {
  if (values.length === 0) return ['- none'];
  return values.map(value => `- ${value}`);
}
