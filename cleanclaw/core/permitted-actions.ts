/**
 * Explicit action policy for CleanClaw.
 *
 * PERMITTED_WITHOUT_ASKING — actions CleanClaw may take freely without user approval.
 * NEVER_WITHOUT_ASKING     — actions that always require explicit user approval.
 *
 * These lists serve as both human-readable documentation and a machine-readable
 * reference. Guard functions in control-contract.ts enforce the same boundaries
 * at runtime; this file makes the policy visible in one place.
 */

export const PERMITTED_WITHOUT_ASKING = [
  'Read any file inside the active project root',
  'List files and folders inside the active project root',
  'Search file contents inside the active project root',
  'Draft the task why from the task description and project context',
  'Draft a plan or propose plan steps',
  'Draft a commit message',
  'Summarize project state, task progress, or task records',
  'Show the workspace scope tree',
  'Show previously approved records (why, plan, approvals, scope tree)',
  'Ask clarifying questions about the task or project',
  'Classify project stack from detected project markers',
  'Check why alignment for a proposed action and report the result',
  'Record why-alignment results',
  'Transition task lifecycle state when all guard conditions are already satisfied',
] as const;

export type PermittedWithoutAsking = (typeof PERMITTED_WITHOUT_ASKING)[number];

export const NEVER_WITHOUT_ASKING = [
  'Edit any file (requires approved why, approved plan, approved file scope, and first-edit approval)',
  'Create a new file (requires scope approval that names the file)',
  'Delete a file',
  'Widen the approved file scope',
  'Read a file outside the active project root',
  'Scan a broad folder or directory tree',
  'Run any command that is not read-only',
  'Run a validation command',
  'Install or update a dependency',
  'Make a network request',
  'Start or stop a service or process',
  'Commit changes to git',
  'Push changes to a remote',
  'Use a frontier model for any step',
  'Change the active provider, model, or sandbox',
  'Enter headless execution mode',
  'Widen the active project root',
  'Write or update project-local records outside the task records folder',
] as const;

export type NeverWithoutAsking = (typeof NEVER_WITHOUT_ASKING)[number];
