export interface HeadlessReviewerDecisionInput {
  proposedDecision: string;
  allowedDecisions: string[];
  whyAlignment: 'aligned' | 'unclear' | 'misaligned';
}

export interface HeadlessReviewerDecisionResult {
  allowed: boolean;
  reason: string;
}

export function evaluateHeadlessReviewerDecision(
  input: HeadlessReviewerDecisionInput,
): HeadlessReviewerDecisionResult {
  if (!input.allowedDecisions.includes(input.proposedDecision)) {
    return {
      allowed: false,
      reason: `Decision is outside approved options: ${input.proposedDecision}`,
    };
  }

  if (input.whyAlignment !== 'aligned') {
    return {
      allowed: false,
      reason: `Decision is ${input.whyAlignment} with the approved why.`,
    };
  }

  return {
    allowed: true,
    reason: 'Decision is inside approved options and aligned with the approved why.',
  };
}
