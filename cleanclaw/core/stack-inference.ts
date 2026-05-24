import type { DetectedProjectMarker } from './project-markers.js';

export interface StackCandidate {
  stack: string;
  score: number;
  confidence: 'low' | 'medium' | 'high';
  evidence: string[];
}

export interface StackInferenceResult {
  candidates: StackCandidate[];
  bestGuess: StackCandidate | null;
  mixedStack: boolean;
  ambiguityNotes: string[];
}

const MARKER_STACKS: Record<string, { stack: string; weight: number }> = {
  node: { stack: 'node', weight: 3 },
  dotnet: { stack: 'dotnet', weight: 3 },
  python: { stack: 'python', weight: 3 },
  go: { stack: 'go', weight: 3 },
  rust: { stack: 'rust', weight: 3 },
  java: { stack: 'java', weight: 3 },
};

const FRAMEWORK_LABELS: Array<{ pattern: RegExp; stack: string; weight: number }> = [
  { pattern: /next\.js/i, stack: 'nextjs', weight: 5 },
  { pattern: /vite/i, stack: 'vite', weight: 4 },
  { pattern: /svelte/i, stack: 'svelte', weight: 5 },
];

export function inferProjectStack(markers: DetectedProjectMarker[]): StackInferenceResult {
  const scores = new Map<string, { score: number; evidence: string[] }>();

  for (const marker of markers) {
    const framework = FRAMEWORK_LABELS.find(candidate => candidate.pattern.test(marker.label));
    const base = framework ?? MARKER_STACKS[marker.kind];
    if (!base) continue;

    const current = scores.get(base.stack) ?? { score: 0, evidence: [] };
    current.score += base.weight;
    current.evidence.push(`${marker.relativePath} (${marker.label})`);
    scores.set(base.stack, current);
  }

  const candidates = [...scores.entries()]
    .map(([stack, value]) => ({
      stack,
      score: value.score,
      confidence: confidenceFor(value.score),
      evidence: value.evidence,
    }))
    .sort((a, b) => b.score - a.score || a.stack.localeCompare(b.stack));

  const bestGuess = candidates[0] ?? null;
  const meaningfulCandidates = candidates.filter(candidate => candidate.score >= 3);
  const mixedStack = meaningfulCandidates.length > 1;
  const ambiguityNotes = buildAmbiguityNotes(candidates, mixedStack);

  return {
    candidates,
    bestGuess,
    mixedStack,
    ambiguityNotes,
  };
}

export function formatStackInference(result: StackInferenceResult): string {
  if (!result.bestGuess) {
    return 'No stack could be inferred from project markers.';
  }

  const lines = [
    `Best guess: ${result.bestGuess.stack} (${result.bestGuess.confidence} confidence)`,
    'Evidence:',
    ...result.bestGuess.evidence.map(item => `- ${item}`),
  ];

  if (result.mixedStack) {
    lines.push('', 'Mixed-stack signals detected:');
    for (const note of result.ambiguityNotes) {
      lines.push(`- ${note}`);
    }
  }

  return lines.join('\n');
}

function confidenceFor(score: number): StackCandidate['confidence'] {
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

function buildAmbiguityNotes(candidates: StackCandidate[], mixedStack: boolean): string[] {
  if (candidates.length === 0) return ['No stack markers were found.'];
  if (!mixedStack) return [];

  return candidates
    .filter(candidate => candidate.score >= 3)
    .map(candidate => `${candidate.stack}: ${candidate.evidence.join(', ')}`);
}
