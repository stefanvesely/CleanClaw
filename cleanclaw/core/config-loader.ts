import fs from 'fs';
import path from 'path';
import os from 'os';
import type { CleanClawConfig } from '../config/config-schema.js';
import defaultConfig from '../config/default-config.json' with { type: 'json' };
import { mergeConfigs } from './config-merger.js';
import { resolveActiveProject } from './project-resolver.js';

export const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.cleanclaw', 'config.json');

export function getConfig(projectRoot?: string): CleanClawConfig {
  const resolvedRoot = projectRoot ?? resolveActiveProject().projectRoot ?? process.cwd();
  return getConfigForProject(resolvedRoot);
}

export function getConfigForProject(projectRoot: string): CleanClawConfig {
  const globalConfig = readConfigFile(GLOBAL_CONFIG_PATH);
  const projectConfig = readConfigFile(path.join(projectRoot, 'cleanclaw.config.json'));
  const withGlobal = mergeConfigs(defaultConfig as Partial<CleanClawConfig>, globalConfig);
  return mergeConfigs(withGlobal, projectConfig);
}

function readConfigFile(filepath: string): Partial<CleanClawConfig> {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as Partial<CleanClawConfig>;
  } catch {
    return {};
  }
}
