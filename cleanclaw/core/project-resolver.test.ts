import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createProjectSettings, saveProjectSettings } from './project-settings.js';
import { resolveActiveProject } from './project-resolver.js';

describe('active project resolver', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-project-resolver-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('prefers project-local settings from the current folder', () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-18T00:00:00.000Z',
    }));

    expect(resolveActiveProject({
      cwd: tmpDir,
      globalProject: path.join(os.tmpdir(), 'other-cleanclaw-project'),
    })).toEqual({
      projectRoot: path.resolve(tmpDir),
      source: 'project-settings',
    });
  });

  it('walks upward to find project settings', () => {
    const nested = path.join(tmpDir, 'src', 'feature');
    fs.mkdirSync(nested, { recursive: true });
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-18T00:00:00.000Z',
    }));

    expect(resolveActiveProject({ cwd: nested, globalProject: null })).toEqual({
      projectRoot: path.resolve(tmpDir),
      source: 'project-settings',
    });
  });

  it('uses cleanclaw.config.json as a local project marker', () => {
    fs.writeFileSync(path.join(tmpDir, 'cleanclaw.config.json'), '{}', 'utf-8');

    expect(resolveActiveProject({ cwd: tmpDir, globalProject: null })).toEqual({
      projectRoot: path.resolve(tmpDir),
      source: 'project-config',
    });
  });

  it('prefers the current project marker over a stale global active project', () => {
    const globalProject = path.join(os.tmpdir(), 'global-cleanclaw-project');
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}', 'utf-8');

    expect(resolveActiveProject({ cwd: tmpDir, globalProject })).toEqual({
      projectRoot: path.resolve(tmpDir),
      source: 'project-marker',
    });
  });

  it('walks upward to find the nearest project marker', () => {
    const nested = path.join(tmpDir, 'src', 'feature');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}', 'utf-8');

    expect(resolveActiveProject({ cwd: nested, globalProject: null })).toEqual({
      projectRoot: path.resolve(tmpDir),
      source: 'project-marker',
    });
  });

  it('falls back to global active project when no local project exists', () => {
    const globalProject = path.join(os.tmpdir(), 'global-cleanclaw-project');

    expect(resolveActiveProject({ cwd: tmpDir, globalProject })).toEqual({
      projectRoot: path.resolve(globalProject),
      source: 'global-active-project',
    });
  });

  it('returns none when no project can be resolved', () => {
    expect(resolveActiveProject({ cwd: tmpDir, globalProject: null })).toEqual({
      projectRoot: null,
      source: 'none',
    });
  });
});
