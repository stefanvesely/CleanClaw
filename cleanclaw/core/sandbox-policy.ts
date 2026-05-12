import { isOpenshellAvailable } from '../wizard/wizard-delegator.js';
import { createConsoleLogger, type CleanClawLogger } from './logger.js';
import type { CleanClawRuntimeContext } from './runtime-context.js';
import { isRunningInsideSandbox, resolveCleanClawSandboxName } from './sandbox-runtime.js';

export type RootPolicyMode = 'host-software-only' | 'host-sandbox-available' | 'sandbox-runtime';

export interface RootPolicyState {
  mode: RootPolicyMode;
  activeRoot: string;
  sandboxName: string | null;
  openshellAvailable: boolean;
  landlock: 'unavailable' | 'available';
}

export function evaluateRootPolicy(options: {
  activeRoot: string;
  openshellAvailable: boolean;
  inSandbox: boolean;
  sandboxName?: string | null;
}): RootPolicyState {
  if (options.inSandbox) {
    return {
      mode: 'sandbox-runtime',
      activeRoot: options.activeRoot,
      sandboxName: options.sandboxName ?? null,
      openshellAvailable: options.openshellAvailable,
      landlock: 'available',
    };
  }

  if (options.openshellAvailable) {
    return {
      mode: 'host-sandbox-available',
      activeRoot: options.activeRoot,
      sandboxName: options.sandboxName ?? null,
      openshellAvailable: true,
      landlock: 'unavailable',
    };
  }

  return {
    mode: 'host-software-only',
    activeRoot: options.activeRoot,
    sandboxName: options.sandboxName ?? null,
    openshellAvailable: false,
    landlock: 'unavailable',
  };
}

export async function applyRootPolicy(
  activeRoot: string,
  logger: CleanClawLogger = createConsoleLogger(),
  runtimeContext?: CleanClawRuntimeContext | null,
): Promise<RootPolicyState> {
  const openshellAvailable = await isOpenshellAvailable();
  const sandboxName = resolveCleanClawSandboxName(runtimeContext);
  const state = evaluateRootPolicy({
    activeRoot,
    openshellAvailable,
    inSandbox: isRunningInsideSandbox(),
    sandboxName,
  });

  if (state.mode === 'host-software-only') {
    logger.info(`[CleanClaw] Enforcement: software boundary only (openshell not available). Active root: ${activeRoot}`);
    return state;
  }

  if (state.mode === 'host-sandbox-available') {
    logger.info(`[CleanClaw] Enforcement: software boundary active on host. OpenShell sandbox available${sandboxName ? ` (${sandboxName})` : ''}; use sandbox execution for kernel boundary.`);
    return state;
  }

  logger.info(`[CleanClaw] Enforcement: OpenShell sandbox runtime active${sandboxName ? ` (${sandboxName})` : ''}; Landlock boundary available, software root guard remains enabled for ${activeRoot}.`);
  return state;
}
