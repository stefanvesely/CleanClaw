import type { CleanClawConfig } from '../config/config-schema.js';
import { update } from './updater-worker.js';

export async function triggerProjectMapUpdate(filePath: string, projectRoot: string, config: CleanClawConfig): Promise<void> {
  if (!config.embeddings) return;

  try {
    await update(projectRoot, filePath, config);
  } catch {
    // Non-fatal — log and continue. A failed index update never blocks the pipeline.
    process.stderr.write(`[ProjectMap] Update failed for ${filePath} — index may be stale.\n`);
  }
}
