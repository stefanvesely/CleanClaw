export type LocalRuntimeProvider = 'ollama-local' | 'vllm-local';
export type LocalRuntimeMode = 'standalone' | 'nemoclaw-backed';
export type LocalRuntimeHealth = 'available' | 'stopped' | 'missing' | 'unconfigured';

export interface LocalRuntimeLifecycleInput {
  provider: LocalRuntimeProvider;
  mode: LocalRuntimeMode;
  health: LocalRuntimeHealth;
  cleanclawRunning: boolean;
  autoStart: boolean;
  keepAliveAfterSession?: boolean;
}

export interface LocalRuntimeLifecycleDecision {
  shouldStart: boolean;
  shouldStopAtSessionEnd: boolean;
  blocked: boolean;
  reasons: string[];
  setupGuidance: string[];
}

export function evaluateLocalRuntimeLifecycle(
  input: LocalRuntimeLifecycleInput,
): LocalRuntimeLifecycleDecision {
  const reasons: string[] = [];
  const setupGuidance: string[] = [];
  const localUnavailable = input.health === 'missing' || input.health === 'unconfigured';
  const shouldStopAtSessionEnd = !input.keepAliveAfterSession;

  if (!input.cleanclawRunning) {
    reasons.push('CleanClaw is not running, so local runtime must not start.');
  }
  if (!input.autoStart) {
    reasons.push('Project setting does not allow local runtime auto-start.');
  }
  if (localUnavailable) {
    reasons.push(`Local runtime is ${input.health}.`);
    setupGuidance.push(...guidanceFor(input));
  }
  if (input.health === 'available') {
    reasons.push('Local runtime is already available.');
  }

  const shouldStart = input.cleanclawRunning
    && input.autoStart
    && input.health === 'stopped';

  if (shouldStart) {
    reasons.push(startReason(input));
  }

  return {
    shouldStart,
    shouldStopAtSessionEnd,
    blocked: localUnavailable || (!input.cleanclawRunning && input.autoStart),
    reasons,
    setupGuidance,
  };
}

function guidanceFor(input: LocalRuntimeLifecycleInput): string[] {
  const providerName = input.provider === 'ollama-local' ? 'Ollama' : 'vLLM';
  const modeGuidance = input.mode === 'nemoclaw-backed'
    ? 'Configure NemoClaw/OpenShell local runtime before using this provider.'
    : `Install and configure ${providerName} before using this provider.`;

  return [
    modeGuidance,
    'Choose a different configured provider, configure local runtime, or stop before execution.',
  ];
}

function startReason(input: LocalRuntimeLifecycleInput): string {
  return input.mode === 'nemoclaw-backed'
    ? `Start ${input.provider} through NemoClaw/OpenShell for this CleanClaw session.`
    : `Start standalone ${input.provider} for this CleanClaw session.`;
}
