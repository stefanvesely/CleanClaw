import { describe, it, expect, vi } from 'vitest';
import { ScopeAgent } from './scope-agent.js';
import type { Bridge } from '../bridges/anthropic-bridge.js';

function makeBridge(): Bridge {
  return { send: vi.fn() } as unknown as Bridge;
}

describe('ScopeAgent', () => {
  it('accepts a bridge in constructor', () => {
    const agent = new ScopeAgent(makeBridge());
    expect(agent).toBeInstanceOf(ScopeAgent);
  });

  it('assess() returns inScope and rationale fields', async () => {
    const agent = new ScopeAgent(makeBridge());
    const result = await agent.assess('add a new method to UserService');
    expect(result).toHaveProperty('inScope');
    expect(result).toHaveProperty('rationale');
    expect(typeof result.inScope).toBe('boolean');
    expect(typeof result.rationale).toBe('string');
  });

  it('assess() returns safe default when bridge is unused', async () => {
    const bridge = makeBridge();
    const agent = new ScopeAgent(bridge);
    const result = await agent.assess('anything');
    expect(result.inScope).toBe(true);
    expect(bridge.send).not.toHaveBeenCalled();
  });
});
