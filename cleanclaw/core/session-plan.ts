import fs from 'fs';
import path from 'path';
import type { TaskWhyIntake } from './task-why.js';
import { assessScopeWhyAlignments, formatScopeWhyAlignments, type ProposedScopeItem } from './why-alignment.js';

export interface DraftSessionPlanInput {
  projectRoot: string;
  taskDescription: string;
  taskWhy: TaskWhyIntake;
  requester: string;
  beneficiary: string;
  taskId: string;
  plannedScopeItems?: ProposedScopeItem[];
  createdAt?: string;
}

export function createDraftSessionPlan(input: DraftSessionPlanInput): string {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const plansDir = path.join(input.projectRoot, 'plans', 'inprogress');
  fs.mkdirSync(plansDir, { recursive: true });

  const filename = `${createdAt.slice(0, 10)}-${slugify(input.taskDescription)}.md`;
  const filepath = nextAvailablePlanPath(plansDir, filename);
  fs.writeFileSync(filepath, formatDraftSessionPlan({ ...input, createdAt }), 'utf-8');
  return filepath;
}

export function formatDraftSessionPlan(input: DraftSessionPlanInput & { createdAt: string }): string {
  const scopeAlignments = assessScopeWhyAlignments({
    approvedWhy: input.taskWhy,
    items: input.plannedScopeItems ?? [],
  });

  return [
    `# ${input.taskDescription.trim()}`,
    '',
    `Created: ${input.createdAt}`,
    'Status: draft',
    `Task ID: ${input.taskId}`,
    `Requester: ${input.requester.trim() || 'not specified'}`,
    `Beneficiary: ${input.beneficiary.trim() || 'not specified'}`,
    '',
    '## Why',
    '',
    input.taskWhy.text,
    '',
    '## What CleanClaw Knows',
    '',
    `- Task: ${input.taskDescription.trim()}`,
    `- Why approved: ${input.taskWhy.approved ? 'yes' : 'no'}`,
    `- Task record: .cleanclaw/tasks/${input.taskId}/state.json`,
    '',
    '## Proposed Scope Why Alignment',
    '',
    formatScopeWhyAlignments(scopeAlignments),
    '',
    '## What Needs Confirmation',
    '',
    '- Planned files and directories',
    '- Scope boundaries',
    '- Validation commands',
    '- Whether this should be a low-token fix or full fix',
    '',
    '## Draft Checklist',
    '',
    '- [ ] Confirm planned files and directories.',
    '- [ ] Confirm out-of-scope areas.',
    '- [ ] Confirm validation plan.',
    '- [ ] Approve plan before implementation.',
    '',
  ].join('\n');
}

function nextAvailablePlanPath(plansDir: string, filename: string): string {
  const parsed = path.parse(filename);
  let candidate = path.join(plansDir, filename);
  let counter = 2;

  while (fs.existsSync(candidate)) {
    candidate = path.join(plansDir, `${parsed.name}-${counter}${parsed.ext}`);
    counter += 1;
  }

  return candidate;
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return slug || 'new-plan';
}
