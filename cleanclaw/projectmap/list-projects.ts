import { readRegistry } from './project-registry.js';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';

export function listProjects(
  projectRoot: string,
  logger: CleanClawLogger = createConsoleLogger(),
): void {
  const entries = readRegistry(projectRoot);
  if (entries.length === 0) {
    logger.info('No projects registered yet.');
    return;
  }
  for (const entry of entries) {
    logger.info(`${entry.name} - ${entry.path} (added: ${entry.addedAt})`);
  }
}
