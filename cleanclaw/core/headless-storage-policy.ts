export type ProjectMapStoragePolicyChoice = 'commit' | 'local' | 'compact' | 'exclude';

export interface HeadlessStoragePolicyInput {
  headless: boolean;
  requestedChoice: ProjectMapStoragePolicyChoice;
  approvedStoragePolicy: string[];
}

export interface HeadlessStoragePolicyDecision {
  allowed: boolean;
  reason: string;
}

export function checkHeadlessStoragePolicy(input: HeadlessStoragePolicyInput): HeadlessStoragePolicyDecision {
  if (!input.headless) {
    return {
      allowed: true,
      reason: 'Interactive storage policy flow can ask the user before changing ProjectMap storage policy.',
    };
  }

  const requested = input.requestedChoice.toLowerCase();
  const approved = input.approvedStoragePolicy.some(line => {
    const normalized = line.toLowerCase();
    return normalized.includes('projectmap') && normalized.includes(requested);
  });

  if (approved) {
    return {
      allowed: true,
      reason: `Approved headless storage policy includes ProjectMap ${input.requestedChoice}.`,
    };
  }

  return {
    allowed: false,
    reason: `Headless execution cannot choose ProjectMap storage policy "${input.requestedChoice}" unless the approved headless plan includes that policy.`,
  };
}

export function assertHeadlessStoragePolicyAllowed(input: HeadlessStoragePolicyInput): void {
  const decision = checkHeadlessStoragePolicy(input);
  if (decision.allowed) return;
  throw new Error(decision.reason);
}
