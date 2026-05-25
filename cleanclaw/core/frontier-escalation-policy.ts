import type { NumberedPromptConfig } from './numbered-prompt.js';

export interface FrontierEscalationInput {
  localTimedOut?: boolean;
  localConfidence?: 'high' | 'medium' | 'low' | 'unknown';
  complexity?: 'simple' | 'moderate' | 'complex';
  risk?: 'low' | 'medium' | 'high';
}

export interface FrontierEscalationDecision {
  escalationRecommended: boolean;
  reasons: string[];
}

export function evaluateFrontierEscalation(input: FrontierEscalationInput): FrontierEscalationDecision {
  const reasons: string[] = [];

  if (input.localTimedOut) reasons.push('local model timed out');
  if (input.localConfidence === 'low' || input.localConfidence === 'unknown') {
    reasons.push(`local confidence is ${input.localConfidence}`);
  }
  if (input.complexity === 'complex') reasons.push('task complexity is high');
  if (input.risk === 'high') reasons.push('task risk is high');

  return {
    escalationRecommended: reasons.length > 0,
    reasons,
  };
}

export function createFrontierEscalationPrompt(
  decision: FrontierEscalationDecision,
): NumberedPromptConfig | null {
  if (!decision.escalationRecommended) return null;

  return {
    question: [
      'Local-first handling needs attention.',
      'Why frontier reviewer is recommended:',
      ...decision.reasons.map(reason => `- ${reason}`),
      '',
      'What should CleanClaw do?',
    ].join('\n'),
    defaultId: 'ask-frontier-reviewer',
    options: [
      {
        id: 'ask-frontier-reviewer',
        label: 'Ask frontier reviewer',
        description: 'Request explicit approval before sending this step to the configured reviewer model.',
        recommended: true,
      },
      {
        id: 'keep-local',
        label: 'Keep local',
        description: 'Continue with local-only handling for this step.',
      },
      {
        id: 'stop-and-plan',
        label: 'Stop and plan',
        description: 'Return to planning before any model escalation.',
      },
    ],
  };
}
