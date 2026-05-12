import { spawnSync } from 'node:child_process';
import path from 'node:path';
import type { CleanClawRuntimeContext } from './runtime-context.js';

export interface SandboxRuntimeEnv {
  CLEANCLAW_IN_SANDBOX?: string;
  CLEANCLAW_ACTIVE_ROOT?: string;
  NEMOCLAW_SANDBOX?: string;
  NEMOCLAW_SANDBOX_NAME?: string;
  SANDBOX_NAME?: string;
}

export interface SandboxExecPlan {
  sandboxName: string;
  args: string[];
  command: string;
}

export interface SandboxExecutionResult {
  attempted: boolean;
  delegated: boolean;
  sandboxName: string | null;
  status: number | null;
  error?: string;
}

export interface SandboxExecutionOptions {
  openshellBin?: string | null;
  env?: NodeJS.ProcessEnv;
  stdio?: 'inherit' | 'pipe';
  spawn?: typeof spawnSync;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export function isRunningInsideSandbox(env: SandboxRuntimeEnv = process.env): boolean {
  return env.CLEANCLAW_IN_SANDBOX === '1';
}

export function resolveCleanClawSandboxName(
  runtimeContext?: CleanClawRuntimeContext | null,
  env: SandboxRuntimeEnv = process.env,
): string | null {
  return runtimeContext?.session.sandboxName
    ?? env.NEMOCLAW_SANDBOX
    ?? env.NEMOCLAW_SANDBOX_NAME
    ?? env.SANDBOX_NAME
    ?? null;
}

export function buildCleanClawSandboxExecPlan(options: {
  sandboxName: string;
  projectRoot: string;
  taskDescription: string;
  headless?: boolean;
  nodeCommand?: string;
  cleanclawEntry?: string;
}): SandboxExecPlan {
  const cleanclawEntry = options.cleanclawEntry ?? './bin/cleanclaw.js';
  const nodeCommand = options.nodeCommand ?? 'node';
  const headlessFlag = options.headless ? ' --headless' : '';
  const command = [
    `cd ${shellQuote(options.projectRoot)}`,
    `CLEANCLAW_IN_SANDBOX=1 CLEANCLAW_ACTIVE_ROOT=${shellQuote(options.projectRoot)} ${shellQuote(nodeCommand)} ${shellQuote(cleanclawEntry)} run ${shellQuote(options.taskDescription)}${headlessFlag}`,
  ].join(' && ');

  return {
    sandboxName: options.sandboxName,
    command,
    args: ['sandbox', 'exec', '--name', options.sandboxName, '--', 'sh', '-lc', command],
  };
}

export async function resolveOpenshellBinary(): Promise<string | null> {
  try {
    const resolveOpenshellPath = ['../../src/lib', 'resolve-openshell.js'].join('/');
    const { resolveOpenshell } = await import(resolveOpenshellPath) as { resolveOpenshell: () => string | null };
    return resolveOpenshell();
  } catch {
    return null;
  }
}

export async function executeCleanClawInSandbox(
  options: {
    sandboxName: string;
    projectRoot: string;
    taskDescription: string;
    headless?: boolean;
  },
  deps: SandboxExecutionOptions = {},
): Promise<SandboxExecutionResult> {
  const openshellBin = deps.openshellBin === undefined ? await resolveOpenshellBinary() : deps.openshellBin;
  if (!openshellBin) {
    return {
      attempted: false,
      delegated: false,
      sandboxName: options.sandboxName,
      status: null,
      error: 'openshell CLI not found',
    };
  }

  const plan = buildCleanClawSandboxExecPlan({
    ...options,
    projectRoot: path.resolve(options.projectRoot),
  });
  const spawn = deps.spawn ?? spawnSync;
  const result = spawn(openshellBin, plan.args, {
    cwd: path.resolve(options.projectRoot),
    env: {
      ...process.env,
      ...(deps.env ?? {}),
      CLEANCLAW_IN_SANDBOX: undefined,
    },
    stdio: deps.stdio ?? 'inherit',
  });

  return {
    attempted: true,
    delegated: result.status === 0,
    sandboxName: options.sandboxName,
    status: result.status ?? null,
    error: result.error?.message,
  };
}
