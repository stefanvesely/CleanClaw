import { describe, expect, it } from 'vitest';
import { assertPlanningIsInteractive } from './headless-planning-guard.js';

describe('headless planning guard', () => {
  it('allows interactive planning phases', () => {
    expect(() => assertPlanningIsInteractive({
      headless: false,
      phase: 'plan',
    })).not.toThrow();
  });

  it('rejects headless planning phases', () => {
    expect(() => assertPlanningIsInteractive({
      headless: true,
      phase: 'why',
    })).toThrow(/cannot run headless/i);
  });
});
