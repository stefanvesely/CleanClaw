import fs from 'fs';
import path from 'path';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { detectProjectMarkers, formatProjectMarkers, type DetectedProjectMarker } from '../core/project-markers.js';
import { ensureProjectSettings, projectSettingsPath } from '../core/project-settings.js';
import { loadState, saveActiveProject } from '../core/state-manager.js';
import { appendToRegistry } from '../projectmap/project-registry.js';

export interface AttachProjectResult {
  projectRoot: string;
  projectName: string;
  markers: DetectedProjectMarker[];
  settingsPath: string;
}

export interface AttachProjectOptions {
  saveActive?: (projectRoot: string) => void;
  appendRegistry?: (projectRoot: string, name: string, projectPath: string) => void;
}

export async function attachProject(
  projectPath: string,
  logger: CleanClawLogger = createConsoleLogger(),
  options: AttachProjectOptions = {},
): Promise<AttachProjectResult> {
  const projectRoot = path.resolve(projectPath);

  if (!fs.existsSync(projectRoot)) {
    throw new Error(`Project directory does not exist: ${projectRoot}`);
  }

  if (!fs.statSync(projectRoot).isDirectory()) {
    throw new Error(`Project path is not a directory: ${projectRoot}`);
  }

  const state = loadState(projectRoot);
  const projectName = state?.projectName ?? path.basename(projectRoot);
  const settings = ensureProjectSettings({
    projectRoot,
    projectName,
    approvalGranularity: 'per-change',
    plansDir: state?.plansDir ?? './plans',
  });
  const markers = detectProjectMarkers(projectRoot);

  const persistActiveProject = options.saveActive ?? saveActiveProject;
  const persistRegistry = options.appendRegistry ?? appendToRegistry;
  persistActiveProject(projectRoot);
  persistRegistry(projectRoot, projectName, projectRoot);

  logger.info(`Attached CleanClaw to ${projectName}.`);
  logger.info(`Root directory: ${projectRoot}`);
  logger.info('Detected markers:');
  for (const marker of formatProjectMarkers(markers)) {
    logger.info(`  - ${marker}`);
  }
  const settingsPath = projectSettingsPath(projectRoot);
  logger.info(`Settings: ${settingsPath}`);
  logger.info(`Approval mode: ${settings.approvalGranularity}`);

  return {
    projectRoot,
    projectName,
    markers,
    settingsPath,
  };
}
