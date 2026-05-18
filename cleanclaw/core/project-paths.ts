import fs from 'fs';
import os from 'os';
import path from 'path';

export interface ResolveProjectPathOptions {
  cwd?: string;
  homeDir?: string;
}

export interface ValidateProjectDirectoryOptions {
  probeWritable?: (projectRoot: string) => boolean;
}

export function resolveProjectPath(input: string, options: ResolveProjectPathOptions = {}): string {
  const cwd = options.cwd ?? process.cwd();
  const homeDir = options.homeDir ?? os.homedir();
  const trimmed = input.trim();

  if (trimmed === '') {
    throw new Error('Project path is required.');
  }

  if (trimmed === '~') {
    return path.resolve(homeDir);
  }

  if (trimmed.startsWith(`~${path.sep}`) || trimmed.startsWith('~/') || trimmed.startsWith('~\\')) {
    return path.resolve(homeDir, trimmed.slice(2));
  }

  return path.resolve(cwd, trimmed);
}

export function validateProjectDirectory(
  projectRoot: string,
  options: ValidateProjectDirectoryOptions = {},
): string {
  const resolved = path.resolve(projectRoot);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Project directory does not exist: ${resolved}`);
  }

  if (!fs.statSync(resolved).isDirectory()) {
    throw new Error(`Project path is not a directory: ${resolved}`);
  }

  const writable = options.probeWritable?.(resolved) ?? canWriteToDirectory(resolved);
  if (!writable) {
    throw new Error(`Project directory is not writable: ${resolved}`);
  }

  return resolved;
}

export function resolveProjectSubpath(projectRoot: string, subpath: string): string {
  return path.isAbsolute(subpath)
    ? path.resolve(subpath)
    : path.resolve(projectRoot, subpath);
}

function canWriteToDirectory(projectRoot: string): boolean {
  const probePath = path.join(projectRoot, `.cleanclaw-write-test-${process.pid}-${Date.now()}`);

  try {
    fs.writeFileSync(probePath, 'cleanclaw write probe', { flag: 'wx' });
    fs.unlinkSync(probePath);
    return true;
  } catch {
    try {
      if (fs.existsSync(probePath)) fs.unlinkSync(probePath);
    } catch {
      // Best effort cleanup only; the caller receives the validation failure.
    }
    return false;
  }
}
