import { describe, expect, it } from 'vitest';
import { comparePlans } from './plan-comparison.js';
import { formatPlanRecommendation, recommendPlan } from './plan-recommendation.js';

describe('plan recommendation', () => {
  it('recommends a plan when there is a clear winner', () => {
    const compared = comparePlans([
      {
        id: 'low',
        label: 'Low-token fix',
        tokenCost: 2,
        safety: 8,
        speed: 8,
        maintainability: 6,
        risk: 2,
        scopeSize: 2,
      },
      {
        id: 'full',
        label: 'Full fix',
        tokenCost: 9,
        safety: 5,
        speed: 3,
        maintainability: 6,
        risk: 8,
        scopeSize: 9,
      },
    ]);

    const recommendation = recommendPlan(compared);

    expect(recommendation.hasClearWinner).toBe(true);
    expect(recommendation.recommended?.id).toBe('low');
    expect(recommendation.reason).toContain('clearly ahead');
  });

  it('does not recommend when top plans are close', () => {
    const compared = comparePlans([
      {
        id: 'low',
        label: 'Low-token fix',
        tokenCost: 3,
        safety: 7,
        speed: 7,
        maintainability: 6,
        risk: 3,
        scopeSize: 3,
      },
      {
        id: 'full',
        label: 'Full fix',
        tokenCost: 4,
        safety: 8,
        speed: 6,
        maintainability: 8,
        risk: 4,
        scopeSize: 5,
      },
    ]);

    const recommendation = recommendPlan(compared);

    expect(recommendation.hasClearWinner).toBe(false);
    expect(recommendation.recommended).toBeUndefined();
    expect(recommendation.reason).toContain('No clear winner');
  });

  it('formats recommendation and fallback output', () => {
    const compared = comparePlans([
      {
        id: 'low',
        label: 'Low-token fix',
        tokenCost: 2,
        safety: 8,
        speed: 8,
        maintainability: 6,
        risk: 2,
        scopeSize: 2,
      },
    ]);

    expect(formatPlanRecommendation(recommendPlan(compared))).toContain('Recommended: Low-token fix');
    expect(formatPlanRecommendation(recommendPlan([]))).toContain('No recommendation.');
  });
});
