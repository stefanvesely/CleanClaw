export type ContextContinuityDecision = 'keep' | 'separate' | 'confirm';

export interface ContextContinuityResult {
  decision: ContextContinuityDecision;
  sharedTerms: string[];
  reason: string;
}

export function assessContextContinuity(input: {
  previousTask: string;
  nextTask: string;
}): ContextContinuityResult {
  const previousTerms = keywords(input.previousTask);
  const nextTerms = keywords(input.nextTask);
  const sharedTerms = previousTerms.filter((term) => nextTerms.includes(term));

  if (sharedTerms.length >= 2) {
    return {
      decision: 'keep',
      sharedTerms,
      reason: `The tasks share context terms: ${sharedTerms.join(', ')}.`,
    };
  }

  if (sharedTerms.length === 1) {
    return {
      decision: 'confirm',
      sharedTerms,
      reason: `The tasks share one context term (${sharedTerms[0]}), so CleanClaw should ask whether to keep context.`,
    };
  }

  return {
    decision: 'separate',
    sharedTerms: [],
    reason: 'The tasks do not share meaningful context terms, so CleanClaw should start a separate task context.',
  };
}

export function formatContextContinuityResult(result: ContextContinuityResult): string {
  return [
    `Context decision: ${result.decision}`,
    `Shared terms: ${result.sharedTerms.length > 0 ? result.sharedTerms.join(', ') : 'none'}`,
    `Reason: ${result.reason}`,
  ].join('\n');
}

function keywords(value: string): string[] {
  return Array.from(new Set(value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4)
    .map(normalizeKeyword)
    .filter((word) => !STOP_WORDS.has(word))));
}

function normalizeKeyword(word: string): string {
  if (word.endsWith('ed') && word.length > 5) return word.slice(0, -1);
  if (word.endsWith('ing') && word.length > 6) return word.slice(0, -3);
  if (word.endsWith('s') && word.length > 5) return word.slice(0, -1);
  return word;
}

const STOP_WORDS = new Set([
  'this',
  'that',
  'with',
  'from',
  'into',
  'next',
  'task',
  'work',
  'make',
  'need',
  'using',
  'create',
  'update',
]);
