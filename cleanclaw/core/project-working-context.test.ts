import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createProjectSettings, saveProjectSettings } from './project-settings.js';
import { formatProjectWorkingContext, resolveProjectWorkingContext } from './project-working-context.js';

describe('project working context', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-working-context-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('recognizes work from the attached project root', () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-24T00:00:00.000Z',
    }));

    expect(resolveProjectWorkingContext({ cwd: tmpDir, globalProject: null })).toMatchObject({
      projectRoot: path.resolve(tmpDir),
      insideProject: true,
      relativeCwd: '.',
      source: 'project-settings',
    });
  });

  it('recognizes work from nested folders inside the attached project', () => {
    const nested = path.join(tmpDir, 'src', 'feature');
    fs.mkdirSync(nested, { recursive: true });
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-24T00:00:00.000Z',
    }));

    expect(resolveProjectWorkingContext({ cwd: nested, globalProject: null })).toMatchObject({
      projectRoot: path.resolve(tmpDir),
      insideProject: true,
      relativeCwd: path.join('src', 'feature'),
      source: 'project-settings',
    });
  });

  it('shows when the resolved active project is outside the current folder', () => {
    const outside = path.join(os.tmpdir(), 'outside-cleanclaw-context');

    expect(resolveProjectWorkingContext({ cwd: outside, globalProject: tmpDir })).toMatchObject({
      projectRoot: path.resolve(tmpDir),
      insideProject: false,
      relativeCwd: null,
      source: 'global-active-project',
    });
  });

  it('formats visible working context', () => {
    const context = resolveProjectWorkingContext({ cwd: tmpDir, globalProject: tmpDir });
    const output = formatProjectWorkingContext(context);

    expect(output).toContain(`Project root: ${path.resolve(tmpDir)}`);
    expect(output).toContain('Inside project: yes');
  });
});
