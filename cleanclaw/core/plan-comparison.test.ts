import { describe, expect, it } from 'vitest';
import { comparePlans, formatPlanComparison, scorePlan } from './plan-comparison.js';

describe('plan comparison', () => {
  it('scores safer, faster, lower-risk plans higher', () => {
    const strong = scorePlan({
      id: 'low',
      label: 'Low-token fix',
      tokenCost: 2,
      safety: 8,
      speed: 8,
      maintainability: 6,
      risk: 2,
      scopeSize: 2,
    });
    const risky = scorePlan({
      id: 'full',
      label: 'Full fix',
      tokenCost: 8,
      safety: 5,
      speed: 4,
      maintainability: 7,
      risk: 7,
      scopeSize: 8,
    });

    expect(strong).toBeGreaterThan(risky);
  });

  it('sorts compared plans by score and includes tradeoffs', () => {
    const results = comparePlans([
      {
        id: 'full',
        label: 'Full fix',
        tokenCost: 8,
        safety: 7,
        speed: 4,
        maintainability: 9,
        risk: 6,
        scopeSize: 8,
      },
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

    expect(results[0].id).toBe('low');
    expect(results[0].tradeoffs).toContain('Lower token cost.');
    expect(results[1].tradeoffs).toContain('Broader scope.');
  });

  it('formats numbered comparison output', () => {
    const output = formatPlanComparison(comparePlans([
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
    ]));

    expect(output).toContain('1. Low-token fix');
    expect(output).toContain('Token cost: 2');
    expect(output).toContain('Safety: 8');
    expect(output).toContain('Tradeoffs:');
  });
});
