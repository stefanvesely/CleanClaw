import { describe, expect, it } from 'vitest';
import { evaluateHeadlessReviewerDecision } from './headless-reviewer-decision.js';

describe('headless reviewer decision', () => {
  it('allows approved decisions that align with the why', () => {
    expect(evaluateHeadlessReviewerDecision({
      proposedDecision: 'run-approved-validation',
      allowedDecisions: ['run-approved-validation', 'stop-and-report'],
      whyAlignment: 'aligned',
    })).toEqual({
      allowed: true,
      reason: 'Decision is inside approved options and aligned with the approved why.',
    });
  });

  it('blocks decisions outside approved options', () => {
    expect(evaluateHeadlessReviewerDecision({
      proposedDecision: 'edit-extra-file',
      allowedDecisions: ['run-approved-validation', 'stop-and-report'],
      whyAlignment: 'aligned',
    })).toMatchObject({
      allowed: false,
      reason: 'Decision is outside approved options: edit-extra-file',
    });
  });

  it('blocks unclear or misaligned why decisions', () => {
    expect(evaluateHeadlessReviewerDecision({
      proposedDecision: 'run-approved-validation',
      allowedDecisions: ['run-approved-validation'],
      whyAlignment: 'unclear',
    }).allowed).toBe(false);

    expect(evaluateHeadlessReviewerDecision({
      proposedDecision: 'run-approved-validation',
      allowedDecisions: ['run-approved-validation'],
      whyAlignment: 'misaligned',
    }).allowed).toBe(false);
  });
});
