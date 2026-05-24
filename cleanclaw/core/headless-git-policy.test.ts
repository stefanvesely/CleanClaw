import { describe, expect, it } from 'vitest';
import { assertHeadlessCanCommit } from './headless-git-policy.js';

describe('headless git policy', () => {
  it('allows non-headless flows to continue to normal commit approval', () => {
    expect(() => assertHeadlessCanCommit(false)).not.toThrow();
  });

  it('rejects commits in headless mode', () => {
    expect(() => assertHeadlessCanCommit(true)).toThrow(/must never commit/i);
  });
});
