import { describe, expect, it } from 'vitest';
import { validateHeadlessModelRoles } from './headless-model-roles.js';

describe('headless model roles', () => {
  it('requires a coder and reviewer role', () => {
    expect(validateHeadlessModelRoles([
      { role: 'coder', model: 'frontier-coder' },
      { role: 'reviewer', model: 'frontier-reviewer' },
    ])).toEqual({
      valid: true,
      missing: [],
    });
  });

  it('allows reviewer-planner as the review role', () => {
    expect(validateHeadlessModelRoles([
      { role: 'coder', model: 'frontier-coder' },
      { role: 'reviewer-planner', model: 'frontier-reviewer' },
    ])).toEqual({
      valid: true,
      missing: [],
    });
  });

  it('reports missing roles', () => {
    expect(validateHeadlessModelRoles([
      { role: 'coder', model: '' },
    ])).toEqual({
      valid: false,
      missing: ['coder model role', 'reviewer/planner model role'],
    });
  });
});
