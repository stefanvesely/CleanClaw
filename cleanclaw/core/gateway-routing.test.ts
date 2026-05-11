import { describe, expect, it } from 'vitest';
import { applyGatewayRoutingPolicy, describeGatewayRouting } from './gateway-routing.js';
import { buildCleanClawRuntimeContext } from './runtime-context.js';
import type { CleanClawConfig } from '../config/config-schema.js';

function config(provider: CleanClawConfig['provider']): CleanClawConfig {
  return {
    provider,
    openai: { apiKey: 'key', model: 'nvidia/nemotron-3-super-120b-a12b' },
    anthropic: { apiKey: 'key', model: 'claude-sonnet-4-6' },
    approvalGranularity: 'per-change',
    logFormat: 'markdown',
    projectName: 'CleanClaw',
    plansDir: './plans',
    stack: 'dotnet',
  };
}

describe('gateway routing policy', () => {
  it('keeps standalone routing direct by default', () => {
    const routed = applyGatewayRoutingPolicy(config('openai-api'));

    expect(describeGatewayRouting(routed)).toEqual({
      mode: 'direct',
      baseURL: null,
      model: 'nvidia/nemotron-3-super-120b-a12b',
    });
  });

  it('routes embedded NemoClaw contexts through inference.local', () => {
    const base = config('nvidia-nim');
    const runtimeContext = buildCleanClawRuntimeContext({
      source: 'nemoclaw-mode',
      config: base,
      credentialEnv: 'OPENAI_API_KEY',
      hasCredential: true,
      session: { metadata: { gatewayName: 'nemoclaw' } },
    });

    const routed = applyGatewayRoutingPolicy(base, { runtimeContext });

    expect(routed.openai?.baseURL).toBe('https://inference.local/v1');
    expect(routed.openai?.model).toBe('inference/nvidia/nemotron-3-super-120b-a12b');
  });

  it('does not reroute local providers in automatic mode', () => {
    const base = config('ollama-local');
    const runtimeContext = buildCleanClawRuntimeContext({
      source: 'nemoclaw-mode',
      config: base,
      credentialEnv: 'OPENAI_API_KEY',
      hasCredential: true,
      session: { metadata: { gatewayName: 'nemoclaw' } },
    });

    const routed = applyGatewayRoutingPolicy(base, { runtimeContext });

    expect(routed.openai?.baseURL).toBeUndefined();
  });

  it('can force anthropic providers through the gateway', () => {
    const routed = applyGatewayRoutingPolicy(config('anthropic-prod'), { mode: 'gateway' });

    expect(routed.anthropic?.baseURL).toBe('https://inference.local');
    expect(routed.anthropic?.model).toBe('inference/claude-sonnet-4-6');
  });
});
