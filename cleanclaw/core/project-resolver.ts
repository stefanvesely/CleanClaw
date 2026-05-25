import fs from 'fs';
import path from 'path';
import { loadActiveProject } from './state-manager.js';
import { detectProjectMarkers } from './project-markers.js';
import { loadProjectSettings, projectSettingsPath } from './project-settings.js';

export interface ActiveProjectResolution {
  projectRoot: string | null;
  source: 'project-settings' | 'project-config' | 'project-marker' | 'global-active-project' | 'none';
}

export function resolveActiveProject(options: {
  cwd?: string;
  globalProject?: string | null;
} = {}): ActiveProjectResolution {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const globalProject = options.globalProject === undefined ? loadActiveProject() : options.globalProject;

  const localRoot = findLocalProjectRoot(cwd);
  if (localRoot) {
    const settings = loadProjectSettings(localRoot);
    if (settings?.projectRoot) {
      return {
        projectRoot: path.resolve(settings.projectRoot),
        source: 'project-settings',
      };
    }

    return {
      projectRoot: localRoot,
      source: 'project-config',
    };
  }

  const markerRoot = findProjectMarkerRoot(cwd);
  if (markerRoot) {
    return {
      projectRoot: markerRoot,
      source: 'project-marker',
    };
  }

  if (globalProject) {
    return {
      projectRoot: path.resolve(globalProject),
      source: 'global-active-project',
    };
  }

  return {
    projectRoot: null,
    source: 'none',
  };
}

function findLocalProjectRoot(startDir: string): string | null {
  let current = path.resolve(startDir);

  while (true) {
    if (
      fs.existsSync(path.join(current, 'cleanclaw.config.json'))
      || fs.existsSync(projectSettingsPath(current))
    ) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function findProjectMarkerRoot(startDir: string): string | null {
  let current = path.resolve(startDir);

  while (true) {
    if (safeDetectProjectMarkers(current).length > 0) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function safeDetectProjectMarkers(projectRoot: string) {
  try {
    return detectProjectMarkers(projectRoot);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code?: string }).code;
      if (code === 'EPERM' || code === 'EACCES' || code === 'ENOENT') {
        return [];
      }
    }
    throw error;
  }
}
