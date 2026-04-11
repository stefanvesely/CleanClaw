import { describe, expect, it } from 'vitest';
import { SvelteAgent } from './svelte-agent.js';
import type { Bridge, BridgeResponse } from '../bridges/anthropic-bridge.js';

const mockChange = {
  filename: 'src/lib/Counter.svelte',
  beforeLines: [{ lineNumber: 3, content: 'let count = 0;' }],
  afterLines: [{ lineNumber: 3, content: 'let count = $state(0);' }],
  explanation: 'Migrated to Svelte 5 rune',
};

const mockBridge: Bridge = {
  send: async (): Promise<BridgeResponse> => ({
    content: JSON.stringify(mockChange),
    model: 'test-model',
    usage: { inputTokens: 10, outputTokens: 20 },
  }),
};

describe('SvelteAgent', () => {
  it('returns a valid ProposedChange from bridge response', async () => {
    const agent = new SvelteAgent();
    const result = await agent.propose('Migrate count to Svelte 5 rune', mockBridge);
    expect(result.filename).toBe('src/lib/Counter.svelte');
    expect(result.beforeLines).toHaveLength(1);
    expect(result.afterLines).toHaveLength(1);
    expect(result.explanation).toBe('Migrated to Svelte 5 rune');
  });

  it('strips markdown code fences before parsing', async () => {
    const fencedBridge: Bridge = {
      send: async (): Promise<BridgeResponse> => ({
        content: '```json\n' + JSON.stringify(mockChange) + '\n```',
        model: 'test-model',
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    };
    const agent = new SvelteAgent();
    const result = await agent.propose('test', fencedBridge);
    expect(result.filename).toBe('src/lib/Counter.svelte');
  });

  it('throws after two failed parse attempts', async () => {
    const badBridge: Bridge = {
      send: async (): Promise<BridgeResponse> => ({
        content: 'not valid json',
        model: 'test-model',
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    };
    const agent = new SvelteAgent();
    await expect(agent.propose('test', badBridge)).rejects.toThrow(/failed after retry/);
  });
});
