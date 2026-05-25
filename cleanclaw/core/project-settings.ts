import fs from 'fs';
import path from 'path';

const CLEANCLAW_DIR = '.cleanclaw';
const SETTINGS_FILE = 'settings.json';

export interface CleanClawProjectSettings {
  projectRoot: string;
  projectName: string;
  approvalGranularity: 'per-change' | 'per-file' | 'per-step';
  preferredPlanStyle: 'guided' | 'concise' | 'detailed';
  runtimeMode: 'ask' | 'standalone' | 'nemoclaw-preferred';
  advancedOptionsVisible: boolean;
  plansDir: string;
  selectedStack?: string;
  detectedMarkers?: ProjectMarkerSetting[];
  updatedAt: string;
}

export interface ProjectMarkerSetting {
  label: string;
  relativePath: string;
  kind: string;
}

export function projectSettingsPath(projectRoot: string): string {
  return path.join(projectRoot, CLEANCLAW_DIR, SETTINGS_FILE);
}

export function createProjectSettings(input: {
  projectRoot: string;
  projectName: string;
  approvalGranularity?: 'per-change' | 'per-file' | 'per-step';
  preferredPlanStyle?: CleanClawProjectSettings['preferredPlanStyle'];
  runtimeMode?: CleanClawProjectSettings['runtimeMode'];
  advancedOptionsVisible?: boolean;
  plansDir?: string;
  selectedStack?: string;
  detectedMarkers?: ProjectMarkerSetting[];
  updatedAt?: string;
}): CleanClawProjectSettings {
  const settings: CleanClawProjectSettings = {
    projectRoot: path.resolve(input.projectRoot),
    projectName: input.projectName,
    approvalGranularity: input.approvalGranularity ?? 'per-change',
    preferredPlanStyle: input.preferredPlanStyle ?? 'guided',
    runtimeMode: input.runtimeMode ?? 'ask',
    advancedOptionsVisible: input.advancedOptionsVisible ?? false,
    plansDir: input.plansDir ?? './plans',
    detectedMarkers: input.detectedMarkers ?? [],
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };

  if (input.selectedStack) {
    settings.selectedStack = input.selectedStack;
  }

  return settings;
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
  selectedStack?: string;
  detectedMarkers?: ProjectMarkerSetting[];
}): CleanClawProjectSettings {
  const existing = loadProjectSettings(input.projectRoot);
  if (existing) {
    if (input.detectedMarkers) {
      const updated = {
        ...existing,
        detectedMarkers: input.detectedMarkers,
        updatedAt: new Date().toISOString(),
      };
      saveProjectSettings(input.projectRoot, updated);
      return updated;
    }
    return existing;
  }

  const settings = createProjectSettings(input);
  saveProjectSettings(input.projectRoot, settings);
  return settings;
}

export function saveSelectedStack(projectRoot: string, stack: string, updatedAt?: string): CleanClawProjectSettings {
  const existing = loadProjectSettings(projectRoot);
  const settings = existing ?? createProjectSettings({
    projectRoot,
    projectName: path.basename(path.resolve(projectRoot)),
  });
  const updated = {
    ...settings,
    selectedStack: stack,
    updatedAt: updatedAt ?? new Date().toISOString(),
  };

  saveProjectSettings(projectRoot, updated);
  return updated;
}

export function updateProjectPreferences(
  projectRoot: string,
  preferences: Partial<Pick<
    CleanClawProjectSettings,
    'approvalGranularity' | 'preferredPlanStyle' | 'runtimeMode' | 'advancedOptionsVisible'
  >>,
  updatedAt?: string,
): CleanClawProjectSettings {
  const existing = loadProjectSettings(projectRoot);
  const settings = existing ?? createProjectSettings({
    projectRoot,
    projectName: path.basename(path.resolve(projectRoot)),
  });
  const updated = {
    ...settings,
    ...preferences,
    updatedAt: updatedAt ?? new Date().toISOString(),
  };

  saveProjectSettings(projectRoot, updated);
  return updated;
}

export function approvalModeFromProjectSettings(
  settings: CleanClawProjectSettings | null,
): CleanClawProjectSettings['approvalGranularity'] {
  return settings?.approvalGranularity ?? 'per-change';
}
