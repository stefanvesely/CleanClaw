import fs from 'fs';
import path from 'path';

export interface InProgressPlanSummary {
  filename: string;
  filepath: string;
  title: string;
  status: string;
  preview: string;
  updatedAt: string;
}

export function listInProgressPlans(projectRoot: string): InProgressPlanSummary[] {
  const plansDir = path.join(projectRoot, 'plans', 'inprogress');
  if (!fs.existsSync(plansDir)) return [];

  return fs.readdirSync(plansDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => summarizePlan(path.join(plansDir, entry.name)))
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

export function formatInProgressPlanChoices(plans: InProgressPlanSummary[]): string {
  if (plans.length === 0) {
    return 'No in-progress plans found.';
  }

  return plans.map((plan, index) => [
    `${index + 1}. ${plan.title}`,
    `   File: ${plan.filename}`,
    `   Status: ${plan.status}`,
    `   Preview: ${plan.preview}`,
  ].join('\n')).join('\n');
}

function summarizePlan(filepath: string): InProgressPlanSummary {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const stat = fs.statSync(filepath);
  const title = lines.find(line => line.startsWith('# '))?.replace(/^#\s+/, '').trim()
    || path.basename(filepath, '.md');
  const status = lines.find(line => /^Status:/i.test(line))?.replace(/^Status:\s*/i, '').trim()
    || 'unknown';
  const preview = lines
    .filter(line => line.trim() && !line.startsWith('#') && !/^Status:/i.test(line))
    .slice(0, 2)
    .join(' ')
    .slice(0, 180)
    || 'No summary available.';

  return {
    filename: path.basename(filepath),
    filepath,
    title,
    status,
    preview,
    updatedAt: stat.mtime.toISOString(),
  };
}
