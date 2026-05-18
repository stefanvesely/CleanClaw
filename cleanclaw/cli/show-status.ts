import path from 'path';
import { loadActiveProject, loadState } from '../core/state-manager.js';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { latestTaskRecordSummary } from '../core/task-records.js';
import { loadProjectSettings, projectSettingsPath } from '../core/project-settings.js';
import { resolveActiveProject } from '../core/project-resolver.js';

export async function showStatus(logger: CleanClawLogger = createConsoleLogger()): Promise<void> {
  const resolvedProject = resolveActiveProject();
  const projectDir = resolvedProject.projectRoot ?? loadActiveProject() ?? process.cwd();
  const state = loadState(projectDir);

  if (!state) {
    logger.info('No active CleanClaw project. Run "cleanclaw init" to initialise one.');
    return;
  }

  logger.info(`\nActive project: ${state.projectName}`);
  logger.info(`Directory:      ${projectDir}`);
  logger.info(`Resolved by:    ${resolvedProject.source}`);
  logger.info(`Last task:      task${state.currentTaskId}${state.currentVariant}`);
  logger.info(`Plans dir:      ${state.plansDir}`);
  logger.info(`Last updated:   ${state.lastUpdated}`);

  const settings = loadProjectSettings(projectDir);
  logger.info(`Settings:       ${settings ? path.relative(projectDir, projectSettingsPath(projectDir)) : 'missing'}`);
  logger.info(`Root setting:   ${settings?.projectRoot ?? 'missing'}`);
  logger.info(`Approval mode:  ${settings?.approvalGranularity ?? 'legacy'}`);

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
