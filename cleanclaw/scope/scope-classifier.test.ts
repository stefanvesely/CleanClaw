import { describe, expect, it } from 'vitest';
import { classify } from './scope-classifier.js';
import type { ClassifierInput } from './scope-classifier.js';
import type { Bridge } from '../bridges/anthropic-bridge.js';

function makeBridge(response: string): Bridge {
  return {
    send: async () => ({ role: 'assistant', content: response }),
  } as unknown as Bridge;
}

const input: ClassifierInput = {
  filename: 'src/foo.ts',
  diff: '+const x = 1;',
  precheckRationale: 'ambiguous',
  taskDescription: 'test',
  planContent: 'plan',
};

describe('classify', () => {
  it('structural → proceed', async () => {
    const r = await classify(input, makeBridge('{"category":"structural"}'));
    expect(r.category).toBe('structural');
    expect(r.action).toBe('proceed');
  });

  it('behavioural → check-silent', async () => {
    const r = await classify(input, makeBridge('{"category":"behavioural"}'));
    expect(r.category).toBe('behavioural');
    expect(r.action).toBe('check-silent');
  });

  it('new-dependency → halt-confirm', async () => {
    const r = await classify(input, makeBridge('{"category":"new-dependency"}'));
    expect(r.category).toBe('new-dependency');
    expect(r.action).toBe('halt-confirm');
  });

  it('unknown category → unmapped + halt-confirm', async () => {
    const r = await classify(input, makeBridge('{"category":"something-unknown"}'));
    expect(r.category).toBe('unmapped');
    expect(r.action).toBe('halt-confirm');
  });

  it('non-JSON response → unmapped + halt-confirm', async () => {
    const r = await classify(input, makeBridge('not json at all'));
    expect(r.category).toBe('unmapped');
    expect(r.action).toBe('halt-confirm');
  });

  it('bridge throws → unmapped + halt-confirm', async () => {
    const throwing = {
      send: async () => { throw new Error('network error'); },
    } as unknown as Bridge;
    const r = await classify(input, throwing);
    expect(r.category).toBe('unmapped');
    expect(r.action).toBe('halt-confirm');
  });
});
