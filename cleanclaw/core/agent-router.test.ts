import { describe, expect, it } from 'vitest';
import { BUILT_IN_GENERIC_AGENT_DEFINITIONS, resolveLanguageAgent } from './agent-router.js';
import type { CleanClawConfig } from '../config/config-schema.js';

describe('agent router', () => {
  it('routes inferred generic stacks to built-in generic agents', () => {
    for (const stack of ['node', 'nextjs', 'vite', 'python', 'go', 'rust', 'java']) {
      expect(resolveLanguageAgent(configFor(stack)).stack).toBe(stack);
    }
  });

  it('routes every planned built-in generic specialist agent', () => {
    for (const stack of Object.keys(BUILT_IN_GENERIC_AGENT_DEFINITIONS)) {
      expect(resolveLanguageAgent(configFor(stack)).stack).toBe(stack);
    }
  });

  it('keeps custom agents as the highest priority route', () => {
    const agent = resolveLanguageAgent({
      ...configFor('nextjs'),
      customAgents: [
        {
          stack: 'nextjs',
          systemPrompt: 'custom nextjs prompt',
        },
      ],
    });

    expect(agent.stack).toBe('nextjs');
  });

  it('still rejects unknown stacks without a custom agent', () => {
    expect(() => resolveLanguageAgent(configFor('unknown-stack'))).toThrow(/No language agent/);
  });
});

function configFor(stack: string): CleanClawConfig {
  return {
    provider: 'anthropic',
    approvalGranularity: 'per-change',
    logFormat: 'markdown',
    projectName: 'Demo',
    plansDir: './plans',
    stack,
  };
}
