import type { NumberedPromptConfig } from './numbered-prompt.js';

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

export type ReviewerGateStage = 'before-execution' | 'before-edit' | 'headless-completion';
export type ReviewerGateRisk = 'low' | 'medium' | 'high';

export interface ReviewerGateInput {
  stage: ReviewerGateStage;
  risk: ReviewerGateRisk;
  scopeChanged?: boolean;
  headless?: boolean;
}

export interface ReviewerGateDecision {
  reviewRequired: boolean;
  purpose: string;
  reasons: string[];
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

export function evaluateReviewerGate(input: ReviewerGateInput): ReviewerGateDecision {
  const reasons: string[] = [];

  if (input.stage === 'before-execution') {
    reasons.push('review before execution');
  }
  if (input.stage === 'headless-completion') {
    reasons.push('review before headless completion');
  }
  if (input.risk === 'high') {
    reasons.push('high-risk change');
  }
  if (input.scopeChanged) {
    reasons.push('approved scope changed');
  }
  if (input.headless) {
    reasons.push('headless work needs independent review');
  }

  return {
    reviewRequired: reasons.length > 0,
    purpose: purposeForReviewerGate(input),
    reasons,
  };
}

export function createReviewerGatePrompt(decision: ReviewerGateDecision): NumberedPromptConfig | null {
  if (!decision.reviewRequired) return null;

  return {
    question: [
      'Reviewer checkpoint required.',
      'Why review is needed:',
      ...decision.reasons.map(reason => `- ${reason}`),
      '',
      'What should CleanClaw do?',
    ].join('\n'),
    defaultId: 'ask-reviewer',
    options: [
      {
        id: 'ask-reviewer',
        label: 'Ask reviewer',
        description: `Request approval to use the reviewer for ${decision.purpose}.`,
        recommended: true,
      },
      {
        id: 'revise-plan',
        label: 'Revise plan',
        description: 'Return to planning and reduce risk or scope before continuing.',
      },
      {
        id: 'stop',
        label: 'Stop',
        description: 'Stop the task and leave the current records unchanged.',
      },
    ],
  };
}

function purposeForReviewerGate(input: ReviewerGateInput): string {
  if (input.stage === 'headless-completion') return 'review-headless-completion';
  if (input.scopeChanged) return 'review-scope-change';
  if (input.risk === 'high') return 'review-risky-change';
  return 'review-before-execution';
}
