import { describe, expect, it } from 'vitest';
import { assertLocalModelAllowed, checkLocalModelPolicy, localModelPurposes } from './local-model-policy.js';

describe('local model policy', () => {
  it('allows approved low-risk planning support purposes', () => {
    for (const purpose of localModelPurposes()) {
      expect(checkLocalModelPolicy({ purpose, risk: 'low', fileCount: 2 })).toMatchObject({
        allowed: true,
        escalationRecommended: false,
      });
    }
  });

  it('blocks unknown local model purposes', () => {
    expect(() => assertLocalModelAllowed({
      purpose: 'execute-code-change',
      risk: 'low',
      fileCount: 1,
    })).toThrow(/not approved/);
  });

  it('recommends reviewer routing for higher-risk local work', () => {
    expect(checkLocalModelPolicy({
      purpose: 'draft-low-risk-suggestion',
      risk: 'high',
      fileCount: 1,
    })).toMatchObject({
      allowed: false,
      escalationRecommended: true,
    });
  });

  it('recommends escalation when file scope is too broad for local-only handling', () => {
    expect(checkLocalModelPolicy({
      purpose: 'inspect-project',
      risk: 'low',
      fileCount: 12,
    })).toMatchObject({
      allowed: false,
      escalationRecommended: true,
    });
  });
});
