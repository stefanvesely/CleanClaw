import path from 'path';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { detectProjectMarkers, formatProjectMarkers, type DetectedProjectMarker } from '../core/project-markers.js';
import { resolveProjectPath, validateProjectDirectory } from '../core/project-paths.js';
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
  cwd?: string;
  homeDir?: string;
  probeWritable?: (projectRoot: string) => boolean;
  saveActive?: (projectRoot: string) => void;
  appendRegistry?: (projectRoot: string, name: string, projectPath: string) => void;
}

export async function attachProject(
  projectPath: string,
  logger: CleanClawLogger = createConsoleLogger(),
  options: AttachProjectOptions = {},
): Promise<AttachProjectResult> {
  const projectRoot = validateProjectDirectory(resolveProjectPath(projectPath, {
    cwd: options.cwd,
    homeDir: options.homeDir,
  }), {
    probeWritable: options.probeWritable,
  });

  const state = loadState(projectRoot);
  const projectName = state?.projectName ?? path.basename(projectRoot);
  const markers = detectProjectMarkers(projectRoot);
  const settings = ensureProjectSettings({
    projectRoot,
    projectName,
    approvalGranularity: 'per-change',
    plansDir: state?.plansDir ?? './plans',
    detectedMarkers: markers.map(marker => ({
      label: marker.label,
      relativePath: marker.relativePath,
      kind: marker.kind,
    })),
  });

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
