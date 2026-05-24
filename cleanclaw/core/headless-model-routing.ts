export interface HeadlessTaskRoutingInput {
  plannedFiles: string[];
  risk: 'low' | 'medium' | 'high';
  estimatedComplexity: 'small' | 'medium' | 'large';
}

export interface HeadlessTaskRoutingDecision {
  coder: 'local' | 'frontier';
  reason: string;
}

export function routeHeadlessCoder(input: HeadlessTaskRoutingInput): HeadlessTaskRoutingDecision {
  const smallFileScope = input.plannedFiles.length > 0 && input.plannedFiles.length <= 2;
  const localEligible = smallFileScope
    && input.risk === 'low'
    && input.estimatedComplexity === 'small';

  if (localEligible) {
    return {
      coder: 'local',
      reason: 'Small, low-risk headless task with limited file scope can use a local coder first.',
    };
  }

  return {
    coder: 'frontier',
    reason: 'Task is too broad, risky, or complex for local-first headless coding.',
  };
}
