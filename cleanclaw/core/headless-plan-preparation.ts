import fs from 'fs';
import { readPlanStatus, writePlanStatus } from './plan-status.js';

export interface HeadlessPlanPreparationInput {
  planPath: string;
  approvedWhy: string;
  scopeTreePath: string;
  riskLimits: string[];
  validationPolicy: string[];
  storagePolicy: string[];
  modelPolicy: {
    coder: string;
    reviewer: string;
  };
  stopConditions: string[];
  preparedBy: string;
  preparedAt?: string;
}

export interface HeadlessPlanPreparationResult {
  ready: boolean;
  statusBefore?: string;
  missing: string[];
  planPath: string;
}

const SECTION_START = '<!-- cleanclaw:headless-preparation:start -->';
const SECTION_END = '<!-- cleanclaw:headless-preparation:end -->';

export function preparePlanForHeadless(input: HeadlessPlanPreparationInput): HeadlessPlanPreparationResult {
  const statusBefore = readPlanStatus(input.planPath);
  const missing = missingPreparationFields(input);

  if (statusBefore !== 'approved') {
    missing.unshift('approved plan status');
  }

  if (missing.length > 0) {
    return {
      ready: false,
      statusBefore,
      missing,
      planPath: input.planPath,
    };
  }

  writePlanStatus(input.planPath, 'ready-for-execution');
  upsertHeadlessPreparationSection(input);

  return {
    ready: true,
    statusBefore,
    missing: [],
    planPath: input.planPath,
  };
}

export function missingPreparationFields(input: HeadlessPlanPreparationInput): string[] {
  const missing: string[] = [];

  if (!input.approvedWhy.trim()) missing.push('approved why');
  if (!input.scopeTreePath.trim()) missing.push('scope tree');
  if (input.riskLimits.length === 0) missing.push('risk limits');
  if (input.validationPolicy.length === 0) missing.push('validation policy');
  if (input.storagePolicy.length === 0) missing.push('storage policy');
  if (!input.modelPolicy.coder.trim()) missing.push('coder model role');
  if (!input.modelPolicy.reviewer.trim()) missing.push('reviewer model role');
  if (input.stopConditions.length === 0) missing.push('stop conditions');
  if (!input.preparedBy.trim()) missing.push('prepared by');

  return missing;
}

function upsertHeadlessPreparationSection(input: HeadlessPlanPreparationInput): void {
  const content = fs.readFileSync(input.planPath, 'utf-8');
  const section = formatHeadlessPreparationSection(input);
  const start = content.indexOf(SECTION_START);
  const end = content.indexOf(SECTION_END);

  if (start !== -1 && end !== -1 && end > start) {
    const before = content.slice(0, start).trimEnd();
    const after = content.slice(end + SECTION_END.length).trimStart();
    fs.writeFileSync(input.planPath, [before, section, after].filter(Boolean).join('\n\n'), 'utf-8');
    return;
  }

  fs.writeFileSync(input.planPath, `${content.trimEnd()}\n\n${section}\n`, 'utf-8');
}

function formatHeadlessPreparationSection(input: HeadlessPlanPreparationInput): string {
  const preparedAt = input.preparedAt ?? new Date().toISOString();

  return [
    SECTION_START,
    '## Headless Preparation',
    '',
    `Prepared: ${preparedAt}`,
    `Prepared by: ${input.preparedBy.trim()}`,
    '',
    '### Approved Why',
    '',
    input.approvedWhy.trim(),
    '',
    '### Scope Tree',
    '',
    `- ${input.scopeTreePath.trim()}`,
    '',
    '### Risk Limits',
    '',
    ...formatList(input.riskLimits),
    '',
    '### Validation Policy',
    '',
    ...formatList(input.validationPolicy),
    '',
    '### Storage Policy',
    '',
    ...formatList(input.storagePolicy),
    '',
    '### Model Policy',
    '',
    `- Coder: ${input.modelPolicy.coder.trim()}`,
    `- Reviewer: ${input.modelPolicy.reviewer.trim()}`,
    '',
    '### Stop Conditions',
    '',
    ...formatList(input.stopConditions),
    SECTION_END,
  ].join('\n');
}

function formatList(values: string[]): string[] {
  return values.map(value => `- ${value.trim()}`).filter(value => value !== '- ');
}
