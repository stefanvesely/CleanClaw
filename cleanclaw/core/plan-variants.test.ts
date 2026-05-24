import { describe, expect, it } from 'vitest';
import { defaultPlanVariants, formatPlanVariantChoices, getPlanVariant } from './plan-variants.js';

describe('plan variants', () => {
  it('defines low-token and full-fix variants', () => {
    const variants = defaultPlanVariants();

    expect(variants.map(variant => variant.kind)).toEqual(['low-token-fix', 'full-fix']);
    expect(variants[0]).toMatchObject({
      label: 'Low-token fix',
      tokenProfile: 'low',
    });
    expect(variants[1]).toMatchObject({
      label: 'Full fix',
      tokenProfile: 'high',
    });
  });

  it('returns a specific variant by kind', () => {
    expect(getPlanVariant('low-token-fix').label).toBe('Low-token fix');
    expect(getPlanVariant('full-fix').label).toBe('Full fix');
  });

  it('formats numbered variant choices with tradeoffs', () => {
    const output = formatPlanVariantChoices(defaultPlanVariants());

    expect(output).toContain('1. Low-token fix');
    expect(output).toContain('2. Full fix');
    expect(output).toContain('Token profile: low');
    expect(output).toContain('Token profile: high');
    expect(output).toContain('Tradeoffs:');
  });
});
