import fs from 'fs';
import path from 'path';
import { writePlanStatus } from './plan-status.js';

export function completePlan(projectRoot: string, filepath: string): string {
  const completeDir = path.join(projectRoot, 'plans', 'complete');
  fs.mkdirSync(completeDir, { recursive: true });

  const filename = path.basename(filepath);
  const dest = path.join(completeDir, filename);

  writePlanStatus(filepath, 'complete');
  fs.renameSync(filepath, dest);

  return dest;
}
