import { classifyProjectQuestion } from './project-question.js';

export type RoutedRequestAction =
  | 'start-plan'
  | 'continue-plan'
  | 'review-plan'
  | 'revise-task'
  | 'cancel-task'
  | 'project-question'
  | 'confirm';

export interface RoutedRequest {
  action: RoutedRequestAction;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

const ROUTES: Array<{ action: RoutedRequestAction; terms: string[]; reason: string }> = [
  { action: 'cancel-task', terms: ['cancel', 'stop', 'abort'], reason: 'User asked to stop or cancel work.' },
  { action: 'revise-task', terms: ['revise', 'change the plan', 'update the plan', 'rework'], reason: 'User asked to revise the current task or plan.' },
  { action: 'review-plan', terms: ['review', 'look over', 'check plan'], reason: 'User asked for review.' },
  { action: 'continue-plan', terms: ['continue', 'resume', 'keep going', 'next'], reason: 'User asked to continue existing work.' },
  { action: 'start-plan', terms: ['new plan', 'start plan', 'plan this', 'create plan'], reason: 'User asked to start planning.' },
];

export function routeNaturalRequest(input: string): RoutedRequest {
  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return { action: 'confirm', confidence: 'low', reason: 'No request was provided.' };
  }

  if (classifyProjectQuestion(input).isProjectQuestion) {
    return { action: 'project-question', confidence: 'high', reason: 'Request is a read-only project question.' };
  }

  const matches = ROUTES.filter((route) => route.terms.some((term) => normalized.includes(term)));
  if (matches.length === 1) {
    return { action: matches[0].action, confidence: 'high', reason: matches[0].reason };
  }

  if (matches.length > 1) {
    return {
      action: 'confirm',
      confidence: 'medium',
      reason: `Request matched multiple safe actions: ${matches.map((match) => match.action).join(', ')}.`,
    };
  }

  return {
    action: 'confirm',
    confidence: 'low',
    reason: 'Request did not clearly map to one safe planning or review action.',
  };
}

export function formatRoutedRequest(route: RoutedRequest): string {
  return [
    `Routed action: ${route.action}`,
    `Confidence: ${route.confidence}`,
    `Reason: ${route.reason}`,
  ].join('\n');
}
