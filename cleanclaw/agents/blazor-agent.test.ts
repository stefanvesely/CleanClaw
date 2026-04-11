import { describe, expect, it } from 'vitest';
import { BlazorAgent } from './blazor-agent.js';
import type { Bridge, BridgeResponse } from '../bridges/anthropic-bridge.js';

const mockChange = {
  filename: 'Components/Counter.razor',
  beforeLines: [{ lineNumber: 8, content: 'private int count = 0;' }],
  afterLines: [{ lineNumber: 8, content: 'private int count = 0; // initialised' }],
  explanation: 'Added inline comment for clarity',
};

const mockBridge: Bridge = {
  send: async (): Promise<BridgeResponse> => ({
    content: JSON.stringify(mockChange),
    model: 'test-model',
    usage: { inputTokens: 10, outputTokens: 20 },
  }),
};

describe('BlazorAgent', () => {
  it('returns a valid ProposedChange from bridge response', async () => {
    const agent = new BlazorAgent();
    const result = await agent.propose('Add comment to counter field', mockBridge);
    expect(result.filename).toBe('Components/Counter.razor');
    expect(result.beforeLines).toHaveLength(1);
    expect(result.afterLines).toHaveLength(1);
    expect(result.explanation).toBe('Added inline comment for clarity');
  });

  it('strips markdown code fences before parsing', async () => {
    const fencedBridge: Bridge = {
      send: async (): Promise<BridgeResponse> => ({
        content: '```json\n' + JSON.stringify(mockChange) + '\n```',
        model: 'test-model',
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    };
    const agent = new BlazorAgent();
    const result = await agent.propose('test', fencedBridge);
    expect(result.filename).toBe('Components/Counter.razor');
  });

  it('throws after two failed parse attempts', async () => {
    const badBridge: Bridge = {
      send: async (): Promise<BridgeResponse> => ({
        content: 'not valid json',
        model: 'test-model',
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    };
    const agent = new BlazorAgent();
    await expect(agent.propose('test', badBridge)).rejects.toThrow(/failed after retry/);
  });
});
