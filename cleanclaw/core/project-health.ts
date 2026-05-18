import fs from 'fs';
import path from 'path';
import { evaluateRootPolicy, type RootPolicyState } from './sandbox-policy.js';
import { isRunningInsideSandbox, resolveCleanClawSandboxName, type SandboxRuntimeEnv } from './sandbox-runtime.js';

export type ProjectMapStatus = 'missing' | 'empty' | 'registry-only' | 'ready';
export type RuntimeStatus = 'standalone-host' | 'nemoclaw-context' | 'sandbox-runtime';

export interface ProjectHealth {
  activeRoot: string;
  configPath: string;
  configExists: boolean;
  projectMap: {
    directory: string;
    status: ProjectMapStatus;
    fileCount: number;
    vectorTableCount: number;
  };
  runtime: {
    status: RuntimeStatus;
    sandboxName: string | null;
    nemoclawSession: boolean;
  };
  guardrails: RootPolicyState;
}

export function collectProjectHealth(options: {
  activeRoot: string;
  openshellAvailable: boolean;
  env?: SandboxRuntimeEnv & { NEMOCLAW_SESSION_ID?: string };
}): ProjectHealth {
  const activeRoot = path.resolve(options.activeRoot);
  const env = options.env ?? process.env;
  const sandboxName = resolveCleanClawSandboxName(null, env);
  const inSandbox = isRunningInsideSandbox(env);
  const nemoclawSession = Boolean(env.NEMOCLAW_SESSION_ID);
  const configPath = path.join(activeRoot, 'cleanclaw.config.json');
  const projectMap = inspectProjectMap(activeRoot);

  return {
    activeRoot,
    configPath,
    configExists: fs.existsSync(configPath),
    projectMap,
    runtime: {
      status: inSandbox ? 'sandbox-runtime' : nemoclawSession ? 'nemoclaw-context' : 'standalone-host',
      sandboxName,
      nemoclawSession,
    },
    guardrails: evaluateRootPolicy({
      activeRoot,
      openshellAvailable: options.openshellAvailable,
      inSandbox,
      sandboxName,
    }),
  };
}

export function formatProjectMapStatus(projectMap: ProjectHealth['projectMap'], activeRoot: string): string {
  const relativeDir = path.relative(activeRoot, projectMap.directory) || projectMap.directory;
  if (projectMap.status === 'missing') return `missing (${relativeDir})`;
  if (projectMap.status === 'empty') return `empty (${relativeDir})`;
  if (projectMap.status === 'registry-only') return `registry only (${relativeDir}, ${projectMap.fileCount} file)`;
  return `ready (${relativeDir}, ${projectMap.vectorTableCount} vector table${projectMap.vectorTableCount === 1 ? '' : 's'})`;
}

export function formatRuntimeStatus(runtime: ProjectHealth['runtime']): string {
  if (runtime.status === 'sandbox-runtime') {
    return `OpenShell sandbox runtime${runtime.sandboxName ? ` (${runtime.sandboxName})` : ''}`;
  }

  if (runtime.status === 'nemoclaw-context') {
    return `NemoClaw context on host${runtime.sandboxName ? ` (${runtime.sandboxName})` : ''}`;
  }

  return `standalone host${runtime.sandboxName ? ` (${runtime.sandboxName})` : ''}`;
}

export function formatGuardrailStatus(guardrails: RootPolicyState): string {
  if (guardrails.mode === 'sandbox-runtime') {
    return 'software root guard + OpenShell sandbox runtime';
  }

  if (guardrails.mode === 'host-sandbox-available') {
    return 'software root guard; OpenShell available, sandbox not active';
  }

  return 'software root guard only; OpenShell unavailable';
}

function inspectProjectMap(activeRoot: string): ProjectHealth['projectMap'] {
  const directory = path.join(activeRoot, '.cleanclaw', 'projectmap');
  if (!fs.existsSync(directory)) {
    return {
      directory,
      status: 'missing',
      fileCount: 0,
      vectorTableCount: 0,
    };
  }

  const files = fs.readdirSync(directory).filter(name => fs.statSync(path.join(directory, name)).isFile());
  const vectorTableCount = files.filter(name => name.endsWith('.vectors.json')).length;
  const status: ProjectMapStatus = vectorTableCount > 0
    ? 'ready'
    : files.includes('registry.json')
      ? 'registry-only'
      : files.length > 0
        ? 'empty'
        : 'empty';

  return {
    directory,
    status,
    fileCount: files.length,
    vectorTableCount,
  };
}
