import fs from 'fs';
import path from 'path';

export function getNextVariant(taskId: string, plansDir: string): string {
  const taskDir = path.join(plansDir, `task${taskId}`);
  if (!fs.existsSync(taskDir)) return 'A';
  const files = fs.readdirSync(taskDir);
  const plans = files.filter(f => f.endsWith('_plan.md'));
  if (plans.length === 0) return 'A';
  const lastVariant = plans[plans.length - 1].charAt(taskId.length + 4);
  return String.fromCharCode(lastVariant.charCodeAt(0) + 1);
}
