import type { CleanClawConfig } from '../config/config-schema.js';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { update } from './updater-worker.js';

export async function triggerProjectMapUpdate(
  filePath: string,
  projectRoot: string,
  config: CleanClawConfig,
  logger: CleanClawLogger = createConsoleLogger(),
): Promise<void> {
  if (config.projectMap?.enabled === false) return;
  if (!config.projectMap?.enabled && !config.embeddings) return;

  try {
    await update(projectRoot, filePath, config, logger);
  } catch {
    // Non-fatal: a failed index update never blocks the pipeline.
    logger.warn(`[ProjectMap] Update failed for ${filePath} - index may be stale.`);
  }
}
