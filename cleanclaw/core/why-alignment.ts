import type { WhyAlignment } from './control-contract.js';
import type { TaskWhyIntake } from './task-why.js';

export interface ProposedScopeItem {
  path: string;
  kind: 'read' | 'edit' | 'new-file' | 'validation';
  rationale: string;
}

export interface ScopeWhyAlignment {
  path: string;
  kind: ProposedScopeItem['kind'];
  result: WhyAlignment;
  rationale: string;
}

const MISALIGNMENT_WORDS = [
  'unrelated',
  'not related',
  'different task',
  'outside scope',
  'does not match',
  'does not align',
  'just in case',
];

export function assessScopeWhyAlignment(input: {
  approvedWhy: TaskWhyIntake;
  item: ProposedScopeItem;
}): ScopeWhyAlignment {
  const rationale = input.item.rationale.trim();
  if (!input.approvedWhy.approved || !input.approvedWhy.text.trim()) {
    return buildAlignment(input.item, 'unclear', 'No approved why is available for this scope item.');
  }

  if (!rationale) {
    return buildAlignment(input.item, 'unclear', 'No rationale explains how this scope item supports the approved why.');
  }

  if (containsMisalignmentLanguage(rationale)) {
    return buildAlignment(input.item, 'misaligned', rationale);
  }

  const overlap = keywordOverlap(input.approvedWhy.text, `${input.item.path} ${rationale}`);
  if (overlap.length === 0) {
    return buildAlignment(
      input.item,
      'unclear',
      `Rationale does not clearly connect to approved why: ${rationale}`,
    );
  }

  return buildAlignment(input.item, 'aligned', rationale);
}

export function assessScopeWhyAlignments(input: {
  approvedWhy: TaskWhyIntake;
  items: ProposedScopeItem[];
}): ScopeWhyAlignment[] {
  return input.items.map((item) => assessScopeWhyAlignment({ approvedWhy: input.approvedWhy, item }));
}

export function formatScopeWhyAlignments(items: ScopeWhyAlignment[]): string {
  if (items.length === 0) return '- none proposed yet';
  return items
    .map((item) => `- ${item.path} (${item.kind}): ${item.result} - ${item.rationale}`)
    .join('\n');
}

function buildAlignment(
  item: ProposedScopeItem,
  result: WhyAlignment,
  rationale: string,
): ScopeWhyAlignment {
  return {
    path: item.path,
    kind: item.kind,
    result,
    rationale,
  };
}

function containsMisalignmentLanguage(value: string): boolean {
  const normalized = value.toLowerCase();
  return MISALIGNMENT_WORDS.some((word) => normalized.includes(word));
}

function keywordOverlap(left: string, right: string): string[] {
  const rightKeywords = new Set(keywords(right));
  return keywords(left).filter((word) => rightKeywords.has(word));
}

function keywords(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4)
    .filter((word) => !STOP_WORDS.has(word));
}

const STOP_WORDS = new Set([
  'this',
  'that',
  'with',
  'from',
  'into',
  'will',
  'work',
  'task',
  'file',
  'safe',
  'clear',
  'purpose',
  'requested',
]);
