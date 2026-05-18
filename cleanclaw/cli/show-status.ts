import path from 'path';
import { loadActiveProject, loadState } from '../core/state-manager.js';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { latestTaskRecordSummary } from '../core/task-records.js';
import { loadProjectSettings, projectSettingsPath } from '../core/project-settings.js';
import { resolveActiveProject } from '../core/project-resolver.js';
import {
  collectProjectHealth,
  formatGuardrailStatus,
  formatProjectMapStatus,
  formatRuntimeStatus,
} from '../core/project-health.js';
import { isOpenshellAvailable } from '../wizard/wizard-delegator.js';
import type { SandboxRuntimeEnv } from '../core/sandbox-runtime.js';

export interface ShowStatusOptions {
  cwd?: string;
  globalProject?: string | null;
  openshellAvailable?: boolean;
  env?: SandboxRuntimeEnv & { NEMOCLAW_SESSION_ID?: string };
}

export async function showStatus(
  logger: CleanClawLogger = createConsoleLogger(),
  options: ShowStatusOptions = {},
): Promise<void> {
  const resolvedProject = resolveActiveProject({
    cwd: options.cwd,
    globalProject: options.globalProject,
  });
  const projectDir = resolvedProject.projectRoot ?? loadActiveProject() ?? process.cwd();
  const state = loadState(projectDir);
  const settings = loadProjectSettings(projectDir);

  if (!state && !settings) {
    logger.info('No active CleanClaw project. Run "cleanclaw init" to initialise one.');
    return;
  }

  logger.info(`\nActive project: ${settings?.projectName ?? state?.projectName ?? path.basename(projectDir)}`);
  logger.info(`Directory:      ${projectDir}`);
  logger.info(`Active root:    ${projectDir}`);
  logger.info(`Resolved by:    ${resolvedProject.source}`);
  logger.info(`Last task:      ${state ? `task${state.currentTaskId}${state.currentVariant}` : 'none'}`);
  logger.info(`Plans dir:      ${settings?.plansDir ?? state?.plansDir ?? './plans'}`);
  logger.info(`Last updated:   ${state?.lastUpdated ?? settings?.updatedAt ?? 'missing'}`);

  logger.info(`Settings:       ${settings ? path.relative(projectDir, projectSettingsPath(projectDir)) : 'missing'}`);
  logger.info(`Root setting:   ${settings?.projectRoot ?? 'missing'}`);
  logger.info(`Approval mode:  ${settings?.approvalGranularity ?? 'legacy'}`);

  const health = collectProjectHealth({
    activeRoot: projectDir,
    openshellAvailable: options.openshellAvailable ?? await isOpenshellAvailable(),
    env: options.env,
  });
  logger.info(`Config:         ${health.configExists ? path.relative(projectDir, health.configPath) : 'missing'}`);
  logger.info(`ProjectMap:     ${formatProjectMapStatus(health.projectMap, projectDir)}`);
  logger.info(`Runtime:        ${formatRuntimeStatus(health.runtime)}`);
  logger.info(`Guardrails:     ${formatGuardrailStatus(health.guardrails)}`);

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
