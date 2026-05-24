import type { NumberedPromptOption } from './numbered-prompt.js';
import type { StackCandidate, StackInferenceResult } from './stack-inference.js';
import { saveSelectedStack } from './project-settings.js';

export function stackSelectionOptions(result: StackInferenceResult): NumberedPromptOption[] {
  const candidateOptions = result.candidates.map(candidate => ({
    id: candidate.stack,
    label: `${candidate.stack} (${candidate.confidence} confidence)`,
    description: formatCandidateEvidence(candidate),
    recommended: candidate.stack === result.bestGuess?.stack,
  }));

  return [
    ...candidateOptions,
    {
      id: 'override',
      label: 'Use another stack',
      description: 'Type a stack id manually if the inferred choices are wrong.',
    },
  ];
}

export function persistSelectedStack(input: {
  projectRoot: string;
  stack: string;
  updatedAt?: string;
}) {
  return saveSelectedStack(input.projectRoot, input.stack, input.updatedAt);
}

function formatCandidateEvidence(candidate: StackCandidate): string {
  return `Evidence: ${candidate.evidence.join('; ')}`;
}
