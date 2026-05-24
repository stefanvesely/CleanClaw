import { describe, expect, it } from 'vitest';
import { routeHeadlessCoder } from './headless-model-routing.js';

describe('headless model routing', () => {
  it('uses a local coder first for small low-risk headless tasks', () => {
    expect(routeHeadlessCoder({
      plannedFiles: ['src/auth/cache.ts'],
      risk: 'low',
      estimatedComplexity: 'small',
    })).toEqual({
      coder: 'local',
      reason: 'Small, low-risk headless task with limited file scope can use a local coder first.',
    });
  });

  it('uses a frontier coder for larger scope', () => {
    expect(routeHeadlessCoder({
      plannedFiles: ['a.ts', 'b.ts', 'c.ts'],
      risk: 'low',
      estimatedComplexity: 'small',
    }).coder).toBe('frontier');
  });

  it('uses a frontier coder for risky or complex tasks', () => {
    expect(routeHeadlessCoder({
      plannedFiles: ['src/auth/cache.ts'],
      risk: 'high',
      estimatedComplexity: 'small',
    }).coder).toBe('frontier');

    expect(routeHeadlessCoder({
      plannedFiles: ['src/auth/cache.ts'],
      risk: 'low',
      estimatedComplexity: 'large',
    }).coder).toBe('frontier');
  });
});
