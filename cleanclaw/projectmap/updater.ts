import { execFileSync } from 'child_process';
import path from 'path';
import type { CleanClawConfig } from '../config/config-schema.js';

const SCRIPT = path.resolve(
  new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
  '..', 'update.py'
);

export function triggerProjectMapUpdate(filePath: string, projectRoot: string, config: CleanClawConfig): void {
  if (!config.embeddings) return;

  const configPath = path.join(projectRoot, 'cleanclaw.config.json');
  try {
    execFileSync('python', [SCRIPT, '--root', projectRoot, '--file', filePath, '--config', configPath], {
      stdio: 'inherit',
      cwd: path.dirname(SCRIPT),
    });
  } catch {
    // Non-fatal — log and continue. A failed index update never blocks the pipeline.
    process.stderr.write(`[ProjectMap] Update failed for ${filePath} — index may be stale.\n`);
  }
}
