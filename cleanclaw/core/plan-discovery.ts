import fs from 'fs';
import path from 'path';

export interface InProgressPlanSummary {
  filename: string;
  filepath: string;
  title: string;
  status: string;
  taskId: string;
  preview: string;
  updatedAt: string;
}

export interface PlanTaskGroup {
  taskId: string;
  plans: InProgressPlanSummary[];
}

export function listInProgressPlans(projectRoot: string): InProgressPlanSummary[] {
  const plansDir = path.join(projectRoot, 'plans', 'inprogress');
  if (!fs.existsSync(plansDir)) return [];

  const terminalStatuses = ['complete', 'cancelled'];

  return fs.readdirSync(plansDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => summarizePlan(path.join(plansDir, entry.name)))
    .filter(plan => !terminalStatuses.includes(plan.status.toLowerCase()))
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

export function groupPlansByTask(plans: InProgressPlanSummary[]): PlanTaskGroup[] {
  const groups = new Map<string, InProgressPlanSummary[]>();

  for (const plan of plans) {
    const taskId = plan.taskId || 'unassigned';
    groups.set(taskId, [...(groups.get(taskId) ?? []), plan]);
  }

  return [...groups.entries()]
    .map(([taskId, taskPlans]) => ({
      taskId,
      plans: taskPlans.sort((a, b) => a.filename.localeCompare(b.filename)),
    }))
    .sort((a, b) => a.taskId.localeCompare(b.taskId));
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

export function formatGroupedPlanChoices(groups: PlanTaskGroup[]): string {
  if (groups.length === 0) {
    return 'No in-progress plans found.';
  }

  let option = 1;
  return groups.map(group => {
    const lines = [`Task: ${group.taskId}`];

    for (const plan of group.plans) {
      lines.push(
        `${option}. ${plan.title}`,
        `   File: ${plan.filename}`,
        `   Status: ${plan.status}`,
        `   Preview: ${plan.preview}`,
      );
      option += 1;
    }

    return lines.join('\n');
  }).join('\n\n');
}

function summarizePlan(filepath: string): InProgressPlanSummary {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const stat = fs.statSync(filepath);
  const title = lines.find(line => line.startsWith('# '))?.replace(/^#\s+/, '').trim()
    || path.basename(filepath, '.md');
  const status = lines.find(line => /^Status:/i.test(line))?.replace(/^Status:\s*/i, '').trim()
    || 'unknown';
  const taskId = lines.find(line => /^Task ID:/i.test(line))?.replace(/^Task ID:\s*/i, '').trim()
    || 'unassigned';
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
    taskId,
    preview,
    updatedAt: stat.mtime.toISOString(),
  };
}
