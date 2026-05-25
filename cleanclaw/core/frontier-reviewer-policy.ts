export interface FrontierReviewerPolicyInput {
  purpose: string;
  phase: string;
  approvedPurposes: string[];
  configuredPhases: string[];
}

export interface FrontierReviewerPolicyDecision {
  allowed: boolean;
  reason: string;
}

export function checkFrontierReviewerPolicy(input: FrontierReviewerPolicyInput): FrontierReviewerPolicyDecision {
  const purpose = input.purpose.trim();
  const phase = input.phase.trim();

  if (input.approvedPurposes.includes(purpose)) {
    return {
      allowed: true,
      reason: `Frontier reviewer approved for purpose: ${purpose}.`,
    };
  }

  if (input.configuredPhases.includes(phase)) {
    return {
      allowed: true,
      reason: `Frontier reviewer configured for phase: ${phase}.`,
    };
  }

  return {
    allowed: false,
    reason: `Frontier reviewer use requires approval for purpose "${purpose}" or explicit configuration for phase "${phase}".`,
  };
}

export function assertFrontierReviewerAllowed(input: FrontierReviewerPolicyInput): void {
  const decision = checkFrontierReviewerPolicy(input);
  if (decision.allowed) return;
  throw new Error(decision.reason);
}
