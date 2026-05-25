import { describe, expect, it } from 'vitest';
import { assertFrontierReviewerAllowed, checkFrontierReviewerPolicy } from './frontier-reviewer-policy.js';

describe('frontier reviewer policy', () => {
  it('allows frontier reviewer use for an exact approved purpose', () => {
    expect(checkFrontierReviewerPolicy({
      purpose: 'review-risky-change',
      phase: 'execution',
      approvedPurposes: ['review-risky-change'],
      configuredPhases: [],
    })).toMatchObject({
      allowed: true,
    });
  });

  it('allows frontier reviewer use for an explicitly configured phase', () => {
    expect(checkFrontierReviewerPolicy({
      purpose: 'review-unusual-diff',
      phase: 'headless-completion',
      approvedPurposes: [],
      configuredPhases: ['headless-completion'],
    })).toMatchObject({
      allowed: true,
    });
  });

  it('blocks frontier reviewer use without exact approval or phase configuration', () => {
    expect(() => assertFrontierReviewerAllowed({
      purpose: 'review-risky-change',
      phase: 'execution',
      approvedPurposes: ['different-purpose'],
      configuredPhases: ['planning'],
    })).toThrow(/requires approval/);
  });
});
