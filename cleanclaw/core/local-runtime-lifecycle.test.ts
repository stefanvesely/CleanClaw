import { describe, expect, it } from 'vitest';
import { evaluateLocalRuntimeLifecycle } from './local-runtime-lifecycle.js';

describe('local runtime lifecycle', () => {
  it('does not start local runtime before CleanClaw is running', () => {
    const decision = evaluateLocalRuntimeLifecycle({
      provider: 'ollama-local',
      mode: 'standalone',
      health: 'stopped',
      cleanclawRunning: false,
      autoStart: true,
    });

    expect(decision).toMatchObject({
      shouldStart: false,
      blocked: true,
      shouldStopAtSessionEnd: true,
    });
    expect(decision.reasons).toContain('CleanClaw is not running, so local runtime must not start.');
  });

  it('starts stopped local runtime only during a CleanClaw session with auto-start enabled', () => {
    const decision = evaluateLocalRuntimeLifecycle({
      provider: 'vllm-local',
      mode: 'nemoclaw-backed',
      health: 'stopped',
      cleanclawRunning: true,
      autoStart: true,
    });

    expect(decision).toMatchObject({
      shouldStart: true,
      shouldStopAtSessionEnd: true,
      blocked: false,
    });
    expect(decision.reasons).toContain('Start vllm-local through NemoClaw/OpenShell for this CleanClaw session.');
  });

  it('gives clear setup guidance when local runtime is missing', () => {
    const decision = evaluateLocalRuntimeLifecycle({
      provider: 'ollama-local',
      mode: 'standalone',
      health: 'missing',
      cleanclawRunning: true,
      autoStart: true,
    });

    expect(decision.shouldStart).toBe(false);
    expect(decision.blocked).toBe(true);
    expect(decision.setupGuidance).toEqual([
      'Install and configure Ollama before using this provider.',
      'Choose a different configured provider, configure local runtime, or stop before execution.',
    ]);
  });

  it('allows an explicit project setting to keep local runtime alive', () => {
    const decision = evaluateLocalRuntimeLifecycle({
      provider: 'ollama-local',
      mode: 'standalone',
      health: 'available',
      cleanclawRunning: true,
      autoStart: false,
      keepAliveAfterSession: true,
    });

    expect(decision.shouldStart).toBe(false);
    expect(decision.shouldStopAtSessionEnd).toBe(false);
  });
});
