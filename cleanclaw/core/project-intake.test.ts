import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createProjectSettings, saveProjectSettings } from './project-settings.js';
import {
  buildProjectIntakeCandidate,
  formatProjectIntakeCandidate,
  resolveUserProjectDirectory,
} from './project-intake.js';

describe('project intake', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-project-intake-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('builds a visible candidate from a resolved project', () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-19T00:00:00.000Z',
    }));
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}', 'utf-8');

    const candidate = buildProjectIntakeCandidate({
      projectRoot: tmpDir,
      source: 'project-settings',
    });

    expect(candidate?.projectName).toBe('Demo');
    expect(candidate?.markers.map(marker => marker.label)).toContain('Node package');
  });

  it('resolves an explicit user directory relative to the current folder', () => {
    const projectDir = path.join(tmpDir, 'project-a');
    fs.mkdirSync(projectDir);
    fs.writeFileSync(path.join(projectDir, 'package.json'), '{}', 'utf-8');

    const candidate = resolveUserProjectDirectory('project-a', tmpDir);

    expect(candidate?.projectRoot).toBe(projectDir);
    expect(candidate?.source).toBe('user-directory');
  });

  it('resolves natural current-folder phrases to the startup directory', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}', 'utf-8');

    const candidate = resolveUserProjectDirectory('the directory I started in', tmpDir);

    expect(candidate?.projectRoot).toBe(path.resolve(tmpDir));
    expect(candidate?.source).toBe('user-directory');
    expect(candidate?.markers.map(marker => marker.label)).toContain('Node package');
  });

  it('formats the candidate with why, root, and project signals', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}', 'utf-8');
    const candidate = resolveUserProjectDirectory(tmpDir);

    const formatted = formatProjectIntakeCandidate(candidate!, 'Fix login cache');

    expect(formatted).toContain('Why:');
    expect(formatted).toContain(`Root directory: ${tmpDir}`);
    expect(formatted).toContain('package.json (Node package)');
  });
});
