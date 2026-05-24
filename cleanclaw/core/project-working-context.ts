import path from 'path';
import { resolveActiveProject, type ActiveProjectResolution } from './project-resolver.js';

export interface ProjectWorkingContext {
  projectRoot: string | null;
  cwd: string;
  source: ActiveProjectResolution['source'];
  insideProject: boolean;
  relativeCwd: string | null;
}

export function resolveProjectWorkingContext(options: {
  cwd?: string;
  globalProject?: string | null;
} = {}): ProjectWorkingContext {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const resolution = resolveActiveProject({ cwd, globalProject: options.globalProject });

  if (!resolution.projectRoot) {
    return {
      projectRoot: null,
      cwd,
      source: resolution.source,
      insideProject: false,
      relativeCwd: null,
    };
  }

  const projectRoot = path.resolve(resolution.projectRoot);
  const relative = path.relative(projectRoot, cwd);
  const insideProject = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));

  return {
    projectRoot,
    cwd,
    source: resolution.source,
    insideProject,
    relativeCwd: insideProject ? (relative || '.') : null,
  };
}

export function formatProjectWorkingContext(context: ProjectWorkingContext): string {
  if (!context.projectRoot) {
    return 'No active CleanClaw project is resolved yet.';
  }

  return [
    `Project root: ${context.projectRoot}`,
    `Current folder: ${context.cwd}`,
    `Resolver source: ${context.source}`,
    `Inside project: ${context.insideProject ? 'yes' : 'no'}`,
    `Relative folder: ${context.relativeCwd ?? 'outside project'}`,
  ].join('\n');
}
