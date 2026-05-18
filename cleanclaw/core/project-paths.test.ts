import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveProjectPath, resolveProjectSubpath, validateProjectDirectory } from './project-paths.js';

describe('project path resolution', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-project-paths-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('resolves dot from the provided cwd', () => {
    expect(resolveProjectPath('.', { cwd: tmpDir })).toBe(path.resolve(tmpDir));
  });

  it('resolves relative paths from the provided cwd', () => {
    expect(resolveProjectPath('nested/project', { cwd: tmpDir })).toBe(path.join(tmpDir, 'nested', 'project'));
  });

  it('keeps absolute paths absolute', () => {
    const absolutePath = path.join(tmpDir, 'project');
    expect(resolveProjectPath(absolutePath, { cwd: path.dirname(tmpDir) })).toBe(absolutePath);
  });

  it('expands home directory shorthand', () => {
    const homeDir = path.join(tmpDir, 'home');

    expect(resolveProjectPath('~', { cwd: tmpDir, homeDir })).toBe(homeDir);
    expect(resolveProjectPath('~/project', { cwd: tmpDir, homeDir })).toBe(path.join(homeDir, 'project'));
    expect(resolveProjectPath('~\\project', { cwd: tmpDir, homeDir })).toBe(path.join(homeDir, 'project'));
  });

  it('rejects empty paths', () => {
    expect(() => resolveProjectPath('  ', { cwd: tmpDir })).toThrow(/required/i);
  });

  it('resolves project-relative subpaths from the active root', () => {
    expect(resolveProjectSubpath(tmpDir, './plans')).toBe(path.join(tmpDir, 'plans'));
  });

  it('keeps absolute project subpaths absolute', () => {
    const plansDir = path.join(tmpDir, 'custom-plans');
    expect(resolveProjectSubpath(path.dirname(tmpDir), plansDir)).toBe(plansDir);
  });
});

describe('project directory validation', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-project-validation-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('accepts existing writable directories', () => {
    expect(validateProjectDirectory(tmpDir)).toBe(path.resolve(tmpDir));
  });

  it('rejects missing directories', () => {
    expect(() => validateProjectDirectory(path.join(tmpDir, 'missing'))).toThrow(/does not exist/i);
  });

  it('rejects file paths', () => {
    const filePath = path.join(tmpDir, 'file.txt');
    fs.writeFileSync(filePath, 'not a directory', 'utf-8');

    expect(() => validateProjectDirectory(filePath)).toThrow(/not a directory/i);
  });

  it('rejects directories that fail the writable probe', () => {
    expect(() => validateProjectDirectory(tmpDir, {
      probeWritable: () => false,
    })).toThrow(/not writable/i);
  });
});
