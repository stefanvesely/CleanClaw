import type { CleanClawConfig } from '../config/config-schema.js';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { update } from './updater-worker.js';

export interface ProjectMapUpdateResult {
  filePath: string;
  status: 'updated' | 'skipped' | 'failed';
  reason?: string;
  updatedAt: string;
}

export async function triggerProjectMapUpdate(
  filePath: string,
  projectRoot: string,
  config: CleanClawConfig,
  logger: CleanClawLogger = createConsoleLogger(),
): Promise<ProjectMapUpdateResult> {
  const updatedAt = new Date().toISOString();
  if (config.projectMap?.enabled === false) {
    return { filePath, status: 'skipped', reason: 'ProjectMap disabled', updatedAt };
  }
  if (!config.projectMap?.enabled && !config.embeddings) {
    return { filePath, status: 'skipped', reason: 'ProjectMap not configured', updatedAt };
  }

  try {
    await update(projectRoot, filePath, config, logger);
    return { filePath, status: 'updated', updatedAt };
  } catch {
    // Non-fatal: a failed index update never blocks the pipeline.
    logger.warn(`[ProjectMap] Update failed for ${filePath} - index may be stale.`);
    return { filePath, status: 'failed', reason: 'ProjectMap update failed', updatedAt };
  }
}
