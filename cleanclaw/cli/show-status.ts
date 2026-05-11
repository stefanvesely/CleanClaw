import path from 'path';
import { loadActiveProject, loadState } from '../core/state-manager.js';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';

export async function showStatus(logger: CleanClawLogger = createConsoleLogger()): Promise<void> {
  const projectDir = loadActiveProject() ?? process.cwd();
  const state = loadState(projectDir);

  if (!state) {
    logger.info('No active CleanClaw project. Run "cleanclaw init" to initialise one.');
    return;
  }

  logger.info(`\nActive project: ${state.projectName}`);
  logger.info(`Directory:      ${projectDir}`);
  logger.info(`Last task:      task${state.currentTaskId}${state.currentVariant}`);
  logger.info(`Plans dir:      ${state.plansDir}`);
  logger.info(`Last updated:   ${state.lastUpdated}`);
}
