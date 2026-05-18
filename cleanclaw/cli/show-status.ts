import path from 'path';
import { loadActiveProject, loadState } from '../core/state-manager.js';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { latestTaskRecordSummary } from '../core/task-records.js';

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

  const latestTask = latestTaskRecordSummary(projectDir);
  if (!latestTask) {
    logger.info('Task records:   none');
    return;
  }

  logger.info(`Task records:   ${path.relative(projectDir, latestTask.directory)}`);
  logger.info(`Task state:     ${latestTask.state?.state ?? 'missing'}`);
  logger.info(`Task why:       ${latestTask.state?.why?.approved ? 'approved' : 'not approved'}`);
  logger.info(`Scope tree:     ${latestTask.scopeTreePath ? path.relative(projectDir, latestTask.scopeTreePath) : 'missing'}`);
}
