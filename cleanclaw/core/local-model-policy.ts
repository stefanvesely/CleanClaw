export type LocalModelPurpose =
  | 'summarize-project'
  | 'inspect-project'
  | 'draft-why'
  | 'draft-plan'
  | 'suggest-file-scope'
  | 'classify-stack'
  | 'draft-low-risk-suggestion';

export interface LocalModelPolicyInput {
  purpose: string;
  risk: 'low' | 'medium' | 'high';
  fileCount?: number;
}

export interface LocalModelPolicyDecision {
  allowed: boolean;
  purpose: string;
  reason: string;
  escalationRecommended: boolean;
}

const ALLOWED_PURPOSES = new Set<LocalModelPurpose>([
  'summarize-project',
  'inspect-project',
  'draft-why',
  'draft-plan',
  'suggest-file-scope',
  'classify-stack',
  'draft-low-risk-suggestion',
]);

export function checkLocalModelPolicy(input: LocalModelPolicyInput): LocalModelPolicyDecision {
  const purpose = input.purpose.trim();
  if (!ALLOWED_PURPOSES.has(purpose as LocalModelPurpose)) {
    return {
      allowed: false,
      purpose,
      reason: `Local model purpose is not approved: ${purpose || '(empty)'}.`,
      escalationRecommended: true,
    };
  }

  if (input.risk !== 'low') {
    return {
      allowed: false,
      purpose,
      reason: `Local model purpose "${purpose}" is ${input.risk} risk and needs reviewer routing.`,
      escalationRecommended: true,
    };
  }

  if ((input.fileCount ?? 0) > 8) {
    return {
      allowed: false,
      purpose,
      reason: `Local model purpose "${purpose}" touches ${input.fileCount} files, above the low-risk local limit.`,
      escalationRecommended: true,
    };
  }

  return {
    allowed: true,
    purpose,
    reason: `Local model may handle ${purpose} as low-risk planning support.`,
    escalationRecommended: false,
  };
}

export function assertLocalModelAllowed(input: LocalModelPolicyInput): void {
  const decision = checkLocalModelPolicy(input);
  if (decision.allowed) return;
  throw new Error(decision.reason);
}

export function localModelPurposes(): LocalModelPurpose[] {
  return [...ALLOWED_PURPOSES];
}
