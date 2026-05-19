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
  | 'done';

export type WhyAlignment = 'aligned' | 'unclear' | 'misaligned';

export type ApprovalMode = 'per-change' | 'per-file' | 'per-step';

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
  firstEditApproval?: ApprovalRecord;
  approvalMode: ApprovalMode;
  scopeTreePath?: string;
  modelPolicy: ModelPolicyState;
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
  done: [],
};

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

export function transitionTaskState(
  state: CleanClawTaskState,
  nextState: TaskLifecycleState,
): CleanClawTaskState {
  assertCanTransition(state, nextState);
  return { ...state, state: nextState };
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
