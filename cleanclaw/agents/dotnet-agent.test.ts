import { describe, expect, it } from 'vitest';
import { DotnetAgent } from './dotnet-agent.js';
import type { Bridge, BridgeResponse } from '../bridges/anthropic-bridge.js';

const mockChange = {
  filename: 'src/Service.cs',
  beforeLines: [{ lineNumber: 1, content: 'public void Process() {}' }],
  afterLines: [{ lineNumber: 1, content: 'public void Process(string input) {}' }],
  explanation: 'Added input parameter',
};

const mockBridge: Bridge = {
  send: async (): Promise<BridgeResponse> => ({
    content: JSON.stringify(mockChange),
    model: 'test-model',
    usage: { inputTokens: 10, outputTokens: 20 },
  }),
};

describe('DotnetAgent', () => {
  it('returns a valid ProposedChange from bridge response', async () => {
    const agent = new DotnetAgent();
    const result = await agent.propose('Add input parameter to Process method', mockBridge);
    expect(result.filename).toBe('src/Service.cs');
    expect(result.beforeLines).toHaveLength(1);
    expect(result.afterLines).toHaveLength(1);
    expect(result.explanation).toBe('Added input parameter');
  });

  it('strips markdown code fences before parsing', async () => {
    const fencedBridge: Bridge = {
      send: async (): Promise<BridgeResponse> => ({
        content: '```json\n' + JSON.stringify(mockChange) + '\n```',
        model: 'test-model',
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    };
    const agent = new DotnetAgent();
    const result = await agent.propose('test', fencedBridge);
    expect(result.filename).toBe('src/Service.cs');
  });

  it('throws after two failed parse attempts', async () => {
    const badBridge: Bridge = {
      send: async (): Promise<BridgeResponse> => ({
        content: 'not valid json',
        model: 'test-model',
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    };
    const agent = new DotnetAgent();
    await expect(agent.propose('test', badBridge)).rejects.toThrow(/failed after retry/);
  });
});
