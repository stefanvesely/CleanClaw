import { describe, expect, it } from 'vitest';
import { AngularAgent } from './angular-agent.js';
import type { Bridge, BridgeResponse } from '../bridges/anthropic-bridge.js';

const mockChange = {
  filename: 'src/app/counter.component.ts',
  beforeLines: [{ lineNumber: 5, content: 'count = 0;' }],
  afterLines: [{ lineNumber: 5, content: 'count = signal(0);' }],
  explanation: 'Migrated to Angular signal',
};

const mockBridge: Bridge = {
  send: async (): Promise<BridgeResponse> => ({
    content: JSON.stringify(mockChange),
    model: 'test-model',
    usage: { inputTokens: 10, outputTokens: 20 },
  }),
};

describe('AngularAgent', () => {
  it('returns a valid ProposedChange from bridge response', async () => {
    const agent = new AngularAgent();
    const result = await agent.propose('Migrate count to Angular signal', mockBridge);
    expect(result.filename).toBe('src/app/counter.component.ts');
    expect(result.beforeLines).toHaveLength(1);
    expect(result.afterLines).toHaveLength(1);
    expect(result.explanation).toBe('Migrated to Angular signal');
  });

  it('strips markdown code fences before parsing', async () => {
    const fencedBridge: Bridge = {
      send: async (): Promise<BridgeResponse> => ({
        content: '```json\n' + JSON.stringify(mockChange) + '\n```',
        model: 'test-model',
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    };
    const agent = new AngularAgent();
    const result = await agent.propose('test', fencedBridge);
    expect(result.filename).toBe('src/app/counter.component.ts');
  });

  it('throws after two failed parse attempts', async () => {
    const badBridge: Bridge = {
      send: async (): Promise<BridgeResponse> => ({
        content: 'not valid json',
        model: 'test-model',
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    };
    const agent = new AngularAgent();
    await expect(agent.propose('test', badBridge)).rejects.toThrow(/failed after retry/);
  });
});
