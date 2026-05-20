import path from 'path';

export type TaskLifecycleState =
  | 'intake'
  | 'why_definition'
  | 'scope'
  | 'plan'
  | 'plan_approval'
  | 'file_scope_approval'
  | 'execution'
  | 'review_diff'
  | 'validation_approval'
  | 'validation'
  | 'changelog'
  | 'commit_approval'
  | 'commit'
  | 'push_approval'
  | 'push'
  | 'done'
  | 'revision'
  | 'blocked'
  | 'cancelled';

export type WhyAlignment = 'aligned' | 'unclear' | 'misaligned';

export type ApprovalMode = 'per-change' | 'per-file' | 'per-step';
export type BroaderApprovalMode = Exclude<ApprovalMode, 'per-change'>;

export type CommandRisk =
  | 'read-only'
  | 'validation'
  | 'network'
  | 'dependency-install'
  | 'service-control'
  | 'destructive'
  | 'commit'
  | 'push';

export interface TaskWhy {
  text: string;
  approved: boolean;
  approvedByUserText?: string;
}

export interface ModelPolicyState {
  mode: 'local_first' | 'frontier_approved' | 'headless';
  frontierApprovedFor: string[];
  headless: boolean;
}

export interface CleanClawTaskState {
  taskId: string;
  state: TaskLifecycleState;
  projectRoot: string;
  taskSummary?: string;
  why?: TaskWhy;
  approvedFiles: string[];
  approvedCommands: string[];
  approvedPlan?: ApprovedPlanRecord;
  firstEditApproval?: ApprovalRecord;
  broaderApproval?: BroaderApprovalRecord;
  cancellation?: TaskStopRecord;
  revision?: TaskRevisionRecord;
  blocker?: TaskBlockerRecord;
  approvalMode: ApprovalMode;
  scopeTreePath?: string;
  modelPolicy: ModelPolicyState;
}

export interface BroaderApprovalRecord extends ApprovalRecord {
  mode: BroaderApprovalMode;
  expiresAtTaskEnd: true;
}

export interface ApprovedPlanRecord extends ApprovalRecord {
  planPath: string;
}

export interface TaskStopRecord extends ApprovalRecord {
  finalState: 'cancelled';
}

export interface TaskRevisionRecord extends ApprovalRecord {
  previousState: TaskLifecycleState;
}

export interface TaskBlockerRecord extends ApprovalRecord {
  previousState: TaskLifecycleState;
  blocker: string;
  requestedFrom?: string;
}

export interface ApprovalRecord {
  timestamp: string;
  state: TaskLifecycleState;
  userText: string;
  subject?: string;
}

export interface WhyAlignmentRecord {
  timestamp: string;
  state: TaskLifecycleState;
  result: WhyAlignment;
  action: string;
  rationale: string;
}

export class ControlContractError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ControlContractError';
  }
}

const TRANSITIONS: Record<TaskLifecycleState, TaskLifecycleState[]> = {
  intake: ['why_definition'],
  why_definition: ['scope'],
  scope: ['plan'],
  plan: ['plan_approval'],
  plan_approval: ['file_scope_approval', 'scope'],
  file_scope_approval: ['execution', 'plan'],
  execution: ['review_diff', 'validation_approval', 'changelog'],
  review_diff: ['execution', 'validation_approval', 'scope'],
  validation_approval: ['validation', 'changelog'],
  validation: ['execution', 'changelog'],
  changelog: ['commit_approval', 'done'],
  commit_approval: ['commit', 'done'],
  commit: ['push_approval', 'done'],
  push_approval: ['push', 'done'],
  push: ['done'],
  revision: ['scope', 'plan', 'cancelled'],
  blocked: ['revision', 'scope', 'plan', 'cancelled'],
  done: [],
  cancelled: [],
};

const CANCELLABLE_STATES: TaskLifecycleState[] = [
  'intake',
  'why_definition',
  'scope',
  'plan',
  'plan_approval',
  'file_scope_approval',
  'execution',
  'review_diff',
  'validation_approval',
  'validation',
  'changelog',
  'commit_approval',
  'commit',
  'push_approval',
  'push',
  'revision',
  'blocked',
];

const REVISION_STATES: TaskLifecycleState[] = [
  'scope',
  'plan',
  'plan_approval',
  'file_scope_approval',
  'execution',
  'review_diff',
  'validation_approval',
  'validation',
  'changelog',
  'blocked',
];

const BLOCKABLE_STATES: TaskLifecycleState[] = [
  'scope',
  'plan',
  'plan_approval',
  'file_scope_approval',
  'execution',
  'review_diff',
  'validation_approval',
  'validation',
  'changelog',
  'revision',
];

export function createTaskState(input: {
  taskId: string;
  projectRoot: string;
  taskSummary?: string;
  approvalMode?: ApprovalMode;
}): CleanClawTaskState {
  return {
    taskId: input.taskId,
    state: 'intake',
    projectRoot: path.resolve(input.projectRoot),
    taskSummary: input.taskSummary,
    approvedFiles: [],
    approvedCommands: [],
    approvalMode: input.approvalMode ?? 'per-change',
    modelPolicy: {
      mode: 'local_first',
      frontierApprovedFor: [],
      headless: false,
    },
  };
}

export function assertCanTransition(
  state: CleanClawTaskState,
  nextState: TaskLifecycleState,
): void {
  const allowed = TRANSITIONS[state.state] ?? [];
  if (!allowed.includes(nextState)) {
    throw new ControlContractError(
      `Cannot transition CleanClaw task from ${state.state} to ${nextState}.`,
      'invalid-transition',
    );
  }

  if (state.state === 'intake' && nextState === 'why_definition' && !state.taskSummary?.trim()) {
    throw new ControlContractError('Cannot leave intake without a task summary.', 'missing-task-summary');
  }

  if (state.state === 'why_definition' && nextState === 'scope') {
    assertWhyApproved(state);
  }

  if (nextState === 'execution') {
    assertWhyApproved(state);
    if (state.approvedFiles.length === 0) {
      throw new ControlContractError('Cannot start execution without approved file scope.', 'missing-file-scope');
    }
  }
}

export function cancelTask(
  state: CleanClawTaskState,
  userText: string,
  timestamp?: string,
): CleanClawTaskState {
  if (!CANCELLABLE_STATES.includes(state.state)) {
    throw new ControlContractError(`Cannot cancel task from ${state.state}.`, 'invalid-cancellation');
  }

  const approval = recordUserApproval({
    state: state.state,
    userText,
    subject: 'task cancellation',
    timestamp,
  });

  return expireBroaderApproval({
    ...state,
    state: 'cancelled',
    cancellation: {
      ...approval,
      finalState: 'cancelled',
    },
  });
}

export function requestTaskRevision(
  state: CleanClawTaskState,
  userText: string,
  timestamp?: string,
): CleanClawTaskState {
  if (!REVISION_STATES.includes(state.state)) {
    throw new ControlContractError(`Cannot revise task from ${state.state}.`, 'invalid-revision');
  }

  const approval = recordUserApproval({
    state: state.state,
    userText,
    subject: 'task revision',
    timestamp,
  });

  return expireBroaderApproval({
    ...state,
    state: 'revision',
    firstEditApproval: undefined,
    approvedFiles: [],
    approvedCommands: [],
    revision: {
      ...approval,
      previousState: state.state,
    },
  });
}

export function markTaskBlocked(
  state: CleanClawTaskState,
  input: {
    blocker: string;
    userText: string;
    requestedFrom?: string;
    timestamp?: string;
  },
): CleanClawTaskState {
  if (!BLOCKABLE_STATES.includes(state.state)) {
    throw new ControlContractError(`Cannot block task from ${state.state}.`, 'invalid-blocked-state');
  }

  const approval = recordUserApproval({
    state: state.state,
    userText: input.userText,
    subject: 'task blocked',
    timestamp: input.timestamp,
  });

  return expireBroaderApproval({
    ...state,
    state: 'blocked',
    firstEditApproval: undefined,
    approvedFiles: [],
    approvedCommands: [],
    blocker: {
      ...approval,
      previousState: state.state,
      blocker: input.blocker,
      requestedFrom: input.requestedFrom,
    },
  });
}

export function formatBlockedWorkSummary(state: CleanClawTaskState): string {
  if (!state.blocker) {
    return 'Blocked: no blocker recorded.';
  }

  return [
    'Blocked work.',
    `Task: ${state.taskId}`,
    `Current state: ${state.state}`,
    `Blocked by: ${state.blocker.blocker}`,
    `Requested from: ${state.blocker.requestedFrom ?? 'not specified'}`,
    `Previous state: ${state.blocker.previousState}`,
    'What should we do next?',
  ].join('\n');
}

export function transitionTaskState(
  state: CleanClawTaskState,
  nextState: TaskLifecycleState,
): CleanClawTaskState {
  assertCanTransition(state, nextState);
  const next = { ...state, state: nextState };
  return nextState === 'done' ? expireBroaderApproval(next) : next;
}

export function assertWhyExists(state: CleanClawTaskState): void {
  if (!state.why?.text.trim()) {
    throw new ControlContractError('Task why is required before this action.', 'missing-why');
  }
}

export function assertWhyApproved(state: CleanClawTaskState): void {
  assertWhyExists(state);
  if (!state.why?.approved) {
    throw new ControlContractError('Task why must be approved by the user.', 'unapproved-why');
  }
}

export function assertWhyAligned(result: WhyAlignment, action: string): void {
  if (result === 'aligned') return;

  throw new ControlContractError(
    `Cannot continue ${action}: why alignment is ${result}.`,
    result === 'unclear' ? 'unclear-why-alignment' : 'misaligned-why',
  );
}

export function assertCanReadFile(state: CleanClawTaskState, filePath: string): void {
  if (isWithinRoot(state.projectRoot, filePath)) return;
  throw new ControlContractError(
    `Reading outside the project root requires explicit approval: ${filePath}`,
    'outside-root-read',
  );
}

export function assertCanEditFile(state: CleanClawTaskState, filePath: string): void {
  assertWhyApproved(state);
  assertPlanApproved(state);
  assertTaskStateAllowsEdit(state);
  assertFirstEditApproved(state);
  if (!isWithinRoot(state.projectRoot, filePath)) {
    throw new ControlContractError(`Cannot edit outside project root: ${filePath}`, 'outside-root-edit');
  }

  const relativePath = toProjectRelative(state.projectRoot, filePath);
  if (!state.approvedFiles.includes(relativePath)) {
    throw new ControlContractError(`Cannot edit unapproved file: ${relativePath}`, 'unapproved-file');
  }
}

export function assertPlanApproved(state: CleanClawTaskState): void {
  if (state.approvedPlan?.userText.trim() && state.approvedPlan.planPath.trim()) return;

  throw new ControlContractError(
    'File changes require an approved plan.',
    'missing-approved-plan',
  );
}

export function assertFirstEditApproved(state: CleanClawTaskState): void {
  if (state.firstEditApproval?.userText.trim()) return;

  throw new ControlContractError(
    'First file edit requires explicit user approval for this task.',
    'missing-first-edit-approval',
  );
}

export function assertTaskStateAllowsEdit(state: CleanClawTaskState): void {
  if (state.state === 'execution' || state.state === 'review_diff') return;

  throw new ControlContractError(
    `Cannot edit files while task is in ${state.state}. Execution must be explicitly approved first.`,
    'edit-before-execution',
  );
}

export function assertCanRunCommand(
  state: CleanClawTaskState,
  command: string,
  risk: CommandRisk,
): void {
  if (risk === 'read-only') return;

  if (!state.approvedCommands.includes(command)) {
    throw new ControlContractError(
      `Command requires explicit approval before it can run: ${command}`,
      `unapproved-command:${risk}`,
    );
  }
}

export function assertCanUseFrontierModel(state: CleanClawTaskState, purpose: string): void {
  if (state.modelPolicy.frontierApprovedFor.includes(purpose)) return;
  throw new ControlContractError(
    `Frontier model use requires approval for: ${purpose}`,
    'unapproved-frontier-model',
  );
}

export function assertCanCommit(state: CleanClawTaskState): void {
  assertCanRunCommand(state, 'git commit', 'commit');
}

export function assertCanPush(state: CleanClawTaskState): void {
  assertCanRunCommand(state, 'git push', 'push');
}

export function recordUserApproval(input: {
  state: TaskLifecycleState;
  userText: string;
  subject?: string;
  timestamp?: string;
}): ApprovalRecord {
  if (!input.userText.trim()) {
    throw new ControlContractError('Approval text cannot be empty.', 'missing-approval-text');
  }

  return {
    timestamp: input.timestamp ?? new Date().toISOString(),
    state: input.state,
    userText: input.userText,
    subject: input.subject,
  };
}

export function recordWhyAlignment(input: {
  state: TaskLifecycleState;
  result: WhyAlignment;
  action: string;
  rationale: string;
  timestamp?: string;
}): WhyAlignmentRecord {
  return {
    timestamp: input.timestamp ?? new Date().toISOString(),
    state: input.state,
    result: input.result,
    action: input.action,
    rationale: input.rationale,
  };
}

export function approveWhy(
  state: CleanClawTaskState,
  whyText: string,
  approvedByUserText: string,
): CleanClawTaskState {
  return {
    ...state,
    why: {
      text: whyText,
      approved: true,
      approvedByUserText,
    },
  };
}

export function approveFiles(state: CleanClawTaskState, files: string[]): CleanClawTaskState {
  return {
    ...state,
    approvedFiles: Array.from(new Set([...state.approvedFiles, ...files.map(normalizeRelativePath)])),
  };
}

export function approvePlan(
  state: CleanClawTaskState,
  planPath: string,
  userText: string,
  timestamp?: string,
): CleanClawTaskState {
  if (!planPath.trim()) {
    throw new ControlContractError('Approved plan path is required.', 'missing-plan-path');
  }

  return {
    ...state,
    approvedPlan: {
      ...recordUserApproval({
        state: state.state,
        userText,
        subject: 'plan approval',
        timestamp,
      }),
      planPath,
    },
  };
}

export function approveFirstEdit(
  state: CleanClawTaskState,
  userText: string,
  approvalModeAfterFirstEdit?: ApprovalMode,
  timestamp?: string,
): CleanClawTaskState {
  return {
    ...state,
    approvalMode: approvalModeAfterFirstEdit ?? state.approvalMode,
    firstEditApproval: recordUserApproval({
      state: state.state,
      userText,
      subject: 'first file edit',
      timestamp,
    }),
  };
}

export function approveBroaderApproval(
  state: CleanClawTaskState,
  mode: BroaderApprovalMode,
  userText: string,
  timestamp?: string,
): CleanClawTaskState {
  const approval = recordUserApproval({
    state: state.state,
    userText,
    subject: `broader approval: ${mode}`,
    timestamp,
  });

  return {
    ...state,
    approvalMode: mode,
    broaderApproval: {
      ...approval,
      mode,
      expiresAtTaskEnd: true,
    },
  };
}

export function expireBroaderApproval(state: CleanClawTaskState): CleanClawTaskState {
  if (!state.broaderApproval && state.approvalMode === 'per-change') return state;

  const { broaderApproval: _broaderApproval, ...rest } = state;
  return {
    ...rest,
    approvalMode: 'per-change',
  };
}

export function approveCommand(state: CleanClawTaskState, command: string): CleanClawTaskState {
  return {
    ...state,
    approvedCommands: Array.from(new Set([...state.approvedCommands, command])),
  };
}

function isWithinRoot(projectRoot: string, filePath: string): boolean {
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, filePath);
  const relative = path.relative(root, resolved);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function toProjectRelative(projectRoot: string, filePath: string): string {
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, filePath);
  return normalizeRelativePath(path.relative(root, resolved));
}

function normalizeRelativePath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}
