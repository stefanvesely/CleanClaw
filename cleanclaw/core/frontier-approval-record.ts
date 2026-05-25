import fs from 'fs';
import path from 'path';
import type { CleanClawTaskState } from './control-contract.js';
import { appendApprovalRecord, ensureTaskRecordDir, saveTaskState } from './task-records.js';

export interface FrontierApprovalInput {
  projectRoot: string;
  taskState: CleanClawTaskState;
  purpose: string;
  model: string;
  userText: string;
  approvedAt?: string;
}

export interface FrontierApprovalResult {
  taskState: CleanClawTaskState;
  statePath: string;
  modelRoutingPath: string;
  approvalRecordsPath: string;
}

const MODEL_ROUTING_FILE = 'model-routing.md';

export function recordFrontierModelApproval(input: FrontierApprovalInput): FrontierApprovalResult {
  const purpose = input.purpose.trim();
  const model = input.model.trim();
  const userText = input.userText.trim();

  if (!purpose) throw new Error('Frontier approval purpose is required.');
  if (!model) throw new Error('Frontier approval model is required.');
  if (!userText) throw new Error('Frontier approval user text is required.');

  const approvedAt = input.approvedAt ?? new Date().toISOString();
  const taskState: CleanClawTaskState = {
    ...input.taskState,
    modelPolicy: {
      ...input.taskState.modelPolicy,
      mode: 'frontier_approved',
      frontierApprovedFor: unique([
        ...input.taskState.modelPolicy.frontierApprovedFor,
        purpose,
      ]),
    },
  };

  const statePath = saveTaskState(input.projectRoot, taskState);
  const dir = ensureTaskRecordDir(input.projectRoot, taskState.taskId);
  const modelRoutingPath = path.join(dir, MODEL_ROUTING_FILE);
  fs.writeFileSync(modelRoutingPath, `${formatFrontierApprovalRecord({ ...input, taskState, approvedAt })}\n`, 'utf-8');
  const approvalRecordsPath = appendApprovalRecord(input.projectRoot, taskState.taskId, {
    timestamp: approvedAt,
    state: taskState.state,
    userText,
    subject: `frontier model approval: ${purpose}`,
  });

  return {
    taskState,
    statePath,
    modelRoutingPath,
    approvalRecordsPath,
  };
}

function formatFrontierApprovalRecord(input: FrontierApprovalInput & { approvedAt: string }): string {
  return [
    '# Model Routing',
    '',
    `Recorded: ${input.approvedAt}`,
    '',
    'Frontier Approval',
    '',
    `Purpose: ${input.purpose.trim()}`,
    `Model: ${input.model.trim()}`,
    `User approval: ${input.userText.trim()}`,
    '',
    'Final route chosen',
    '',
    '- frontier approved for exact recorded purpose',
  ].join('\n');
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}
