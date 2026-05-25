import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  approvalModeFromProjectSettings,
  createProjectSettings,
  ensureProjectSettings,
  loadProjectSettings,
  projectSettingsPath,
  saveSelectedStack,
  saveProjectSettings,
  updateProjectPreferences,
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
      preferredPlanStyle: 'guided',
      runtimeMode: 'ask',
      advancedOptionsVisible: false,
      plansDir: './plans',
      detectedMarkers: [],
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

  it('updates detected markers without changing existing approval preferences', () => {
    const existing = createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      approvalGranularity: 'per-file',
      updatedAt: '2026-05-18T00:00:00.000Z',
    });
    saveProjectSettings(tmpDir, existing);

    const ensured = ensureProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      approvalGranularity: 'per-change',
      detectedMarkers: [{ label: 'Node package', relativePath: 'package.json', kind: 'node' }],
    });

    expect(ensured.approvalGranularity).toBe('per-file');
    expect(ensured.detectedMarkers).toEqual([
      { label: 'Node package', relativePath: 'package.json', kind: 'node' },
    ]);
  });

  it('returns granular approval mode unless project settings say otherwise', () => {
    expect(approvalModeFromProjectSettings(null)).toBe('per-change');
    expect(approvalModeFromProjectSettings(createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      approvalGranularity: 'per-file',
    }))).toBe('per-file');
  });

  it('saves selected stack without changing existing approval preferences', () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      approvalGranularity: 'per-file',
      updatedAt: '2026-05-18T00:00:00.000Z',
    }));

    const updated = saveSelectedStack(tmpDir, 'nextjs', '2026-05-24T00:00:00.000Z');

    expect(updated).toMatchObject({
      projectRoot: path.resolve(tmpDir),
      projectName: 'Demo',
      approvalGranularity: 'per-file',
      selectedStack: 'nextjs',
      updatedAt: '2026-05-24T00:00:00.000Z',
    });
    expect(loadProjectSettings(tmpDir)?.selectedStack).toBe('nextjs');
  });

  it('saves project workflow preferences without erasing existing settings', () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      approvalGranularity: 'per-change',
      selectedStack: 'nextjs',
      updatedAt: '2026-05-18T00:00:00.000Z',
    }));

    const updated = updateProjectPreferences(tmpDir, {
      approvalGranularity: 'per-file',
      preferredPlanStyle: 'detailed',
      runtimeMode: 'nemoclaw-preferred',
      advancedOptionsVisible: true,
    }, '2026-05-25T00:00:00.000Z');

    expect(updated).toMatchObject({
      projectName: 'Demo',
      selectedStack: 'nextjs',
      approvalGranularity: 'per-file',
      preferredPlanStyle: 'detailed',
      runtimeMode: 'nemoclaw-preferred',
      advancedOptionsVisible: true,
      updatedAt: '2026-05-25T00:00:00.000Z',
    });
    expect(loadProjectSettings(tmpDir)).toEqual(updated);
  });

  it('creates settings when saving preferences for a new project', () => {
    const updated = updateProjectPreferences(tmpDir, {
      runtimeMode: 'standalone',
    }, '2026-05-25T00:00:00.000Z');

    expect(updated).toMatchObject({
      projectRoot: path.resolve(tmpDir),
      projectName: path.basename(path.resolve(tmpDir)),
      approvalGranularity: 'per-change',
      preferredPlanStyle: 'guided',
      runtimeMode: 'standalone',
      advancedOptionsVisible: false,
    });
  });
});
