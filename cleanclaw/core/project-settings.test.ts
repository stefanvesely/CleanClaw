import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createProjectSettings,
  ensureProjectSettings,
  loadProjectSettings,
  projectSettingsPath,
  saveProjectSettings,
} from './project-settings.js';

describe('CleanClaw project settings', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-project-settings-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates project-local settings with safe defaults', () => {
    expect(createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-18T00:00:00.000Z',
    })).toEqual({
      projectRoot: path.resolve(tmpDir),
      projectName: 'Demo',
      approvalGranularity: 'per-change',
      plansDir: './plans',
      updatedAt: '2026-05-18T00:00:00.000Z',
    });
  });

  it('saves and loads .cleanclaw/settings.json', () => {
    const settings = createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      approvalGranularity: 'per-file',
      updatedAt: '2026-05-18T00:00:00.000Z',
    });

    const filepath = saveProjectSettings(tmpDir, settings);

    expect(filepath).toBe(path.join(tmpDir, '.cleanclaw', 'settings.json'));
    expect(projectSettingsPath(tmpDir)).toBe(filepath);
    expect(loadProjectSettings(tmpDir)).toEqual(settings);
  });

  it('returns null when project settings do not exist', () => {
    expect(loadProjectSettings(tmpDir)).toBeNull();
  });

  it('ensures settings without overwriting existing project preferences', () => {
    const existing = createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      approvalGranularity: 'per-file',
      updatedAt: '2026-05-18T00:00:00.000Z',
    });
    saveProjectSettings(tmpDir, existing);

    const ensured = ensureProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Changed',
      approvalGranularity: 'per-step',
    });

    expect(ensured).toEqual(existing);
  });
});
