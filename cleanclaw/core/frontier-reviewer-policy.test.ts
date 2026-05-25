import { describe, expect, it } from 'vitest';
import {
  assertFrontierReviewerAllowed,
  checkFrontierReviewerPolicy,
  createReviewerGatePrompt,
  evaluateReviewerGate,
} from './frontier-reviewer-policy.js';

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

  it('requires a reviewer gate before execution', () => {
    expect(evaluateReviewerGate({
      stage: 'before-execution',
      risk: 'low',
    })).toEqual({
      reviewRequired: true,
      purpose: 'review-before-execution',
      reasons: ['review before execution'],
    });
  });

  it('requires a reviewer gate for high-risk or scope-changing edits', () => {
    expect(evaluateReviewerGate({
      stage: 'before-edit',
      risk: 'high',
      scopeChanged: true,
    })).toEqual({
      reviewRequired: true,
      purpose: 'review-scope-change',
      reasons: ['high-risk change', 'approved scope changed'],
    });
  });

  it('requires a reviewer gate before headless completion', () => {
    expect(evaluateReviewerGate({
      stage: 'headless-completion',
      risk: 'medium',
      headless: true,
    })).toEqual({
      reviewRequired: true,
      purpose: 'review-headless-completion',
      reasons: [
        'review before headless completion',
        'headless work needs independent review',
      ],
    });
  });

  it('does not require review for low-risk in-scope edit checks', () => {
    expect(evaluateReviewerGate({
      stage: 'before-edit',
      risk: 'low',
    })).toEqual({
      reviewRequired: false,
      purpose: 'review-before-execution',
      reasons: [],
    });
    expect(createReviewerGatePrompt(evaluateReviewerGate({
      stage: 'before-edit',
      risk: 'low',
    }))).toBeNull();
  });

  it('formats a numbered reviewer prompt for high-risk work', () => {
    const prompt = createReviewerGatePrompt(evaluateReviewerGate({
      stage: 'before-edit',
      risk: 'high',
    }));

    expect(prompt).toMatchObject({
      defaultId: 'ask-reviewer',
      options: [
        { id: 'ask-reviewer', recommended: true },
        { id: 'revise-plan' },
        { id: 'stop' },
      ],
    });
    expect(prompt?.question).toContain('Reviewer checkpoint required.');
    expect(prompt?.question).toContain('- high-risk change');
    expect(prompt?.options[0].description).toContain('review-risky-change');
  });
});
