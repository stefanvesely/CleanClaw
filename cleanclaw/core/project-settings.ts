import fs from 'fs';
import path from 'path';

const CLEANCLAW_DIR = '.cleanclaw';
const SETTINGS_FILE = 'settings.json';

export interface CleanClawProjectSettings {
  projectRoot: string;
  projectName: string;
  approvalGranularity: 'per-change' | 'per-file' | 'per-step';
  plansDir: string;
  updatedAt: string;
}

export function projectSettingsPath(projectRoot: string): string {
  return path.join(projectRoot, CLEANCLAW_DIR, SETTINGS_FILE);
}

export function createProjectSettings(input: {
  projectRoot: string;
  projectName: string;
  approvalGranularity?: 'per-change' | 'per-file' | 'per-step';
  plansDir?: string;
  updatedAt?: string;
}): CleanClawProjectSettings {
  return {
    projectRoot: path.resolve(input.projectRoot),
    projectName: input.projectName,
    approvalGranularity: input.approvalGranularity ?? 'per-change',
    plansDir: input.plansDir ?? './plans',
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export function saveProjectSettings(projectRoot: string, settings: CleanClawProjectSettings): string {
  const filepath = projectSettingsPath(projectRoot);
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, `${JSON.stringify(settings, null, 2)}\n`, 'utf-8');
  return filepath;
}

export function loadProjectSettings(projectRoot: string): CleanClawProjectSettings | null {
  const filepath = projectSettingsPath(projectRoot);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as CleanClawProjectSettings;
}

export function ensureProjectSettings(input: {
  projectRoot: string;
  projectName: string;
  approvalGranularity?: 'per-change' | 'per-file' | 'per-step';
  plansDir?: string;
}): CleanClawProjectSettings {
  const existing = loadProjectSettings(input.projectRoot);
  if (existing) return existing;

  const settings = createProjectSettings(input);
  saveProjectSettings(input.projectRoot, settings);
  return settings;
}
