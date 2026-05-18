import fs from 'fs';
import path from 'path';
import { loadActiveProject } from './state-manager.js';
import { loadProjectSettings, projectSettingsPath } from './project-settings.js';

export interface ActiveProjectResolution {
  projectRoot: string | null;
  source: 'project-settings' | 'project-config' | 'global-active-project' | 'none';
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
