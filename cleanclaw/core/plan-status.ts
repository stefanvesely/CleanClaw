import fs from 'fs';
import path from 'path';

export type PlanStatus =
  | 'draft'
  | 'needs-user-review'
  | 'approved'
  | 'ready-for-execution'
  | 'inprogress'
  | 'blocked'
  | 'cancelled'
  | 'complete';

export function readPlanStatus(filepath: string): PlanStatus | undefined {
  const content = fs.readFileSync(filepath, 'utf-8');
  const match = content.split(/\r?\n/).find(line => /^Status:/i.test(line));
  if (!match) return undefined;
  const raw = match.replace(/^Status:\s*/i, '').trim().toLowerCase().replace(/\s+/g, '-');
  return isKnownPlanStatus(raw) ? raw : undefined;
}

export function writePlanStatus(filepath: string, status: PlanStatus): void {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const statusIndex = lines.findIndex(line => /^Status:/i.test(line));

  if (statusIndex !== -1) {
    lines[statusIndex] = `Status: ${status}`;
  } else {
    const titleIndex = lines.findIndex(line => line.startsWith('# '));
    const insertAt = titleIndex !== -1 ? titleIndex + 1 : 0;
    lines.splice(insertAt, 0, `Status: ${status}`);
  }

  fs.writeFileSync(filepath, lines.join('\n'), 'utf-8');
}

export function getPlanFilepath(projectRoot: string, folder: string, filename: string): string {
  return path.join(projectRoot, '.cleanclaw', 'plans', folder, filename);
}

function isKnownPlanStatus(value: string): value is PlanStatus {
  const known: PlanStatus[] = [
    'draft', 'needs-user-review', 'approved', 'ready-for-execution',
    'inprogress', 'blocked', 'cancelled', 'complete',
  ];
  return known.includes(value as PlanStatus);
}
