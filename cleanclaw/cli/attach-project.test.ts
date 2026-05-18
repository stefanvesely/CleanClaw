import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryLogger } from '../core/logger.js';
import { loadProjectSettings } from '../core/project-settings.js';
import { attachProject } from './attach-project.js';

describe('attachProject', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-attach-project-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('attaches CleanClaw to an existing project directory', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}', 'utf-8');
    const logger = createMemoryLogger();
    const savedActive: string[] = [];
    const registryEntries: string[] = [];

    const result = await attachProject(tmpDir, logger, {
      saveActive: projectRoot => savedActive.push(projectRoot),
      appendRegistry: (_projectRoot, _name, projectPath) => registryEntries.push(projectPath),
    });

    expect(result.projectRoot).toBe(path.resolve(tmpDir));
    expect(result.projectName).toBe(path.basename(tmpDir));
    expect(result.markers.map(marker => marker.relativePath)).toContain('package.json');
    expect(loadProjectSettings(tmpDir)).toMatchObject({
      projectRoot: path.resolve(tmpDir),
      projectName: path.basename(tmpDir),
      approvalGranularity: 'per-change',
      plansDir: './plans',
    });
    expect(savedActive).toEqual([path.resolve(tmpDir)]);
    expect(registryEntries).toEqual([path.resolve(tmpDir)]);
    expect(logger.records.some(record => String(record.message).includes('Detected markers'))).toBe(true);
  });

  it('resolves relative paths from the caller cwd', async () => {
    const projectDir = path.join(tmpDir, 'project');
    fs.mkdirSync(projectDir);
    fs.writeFileSync(path.join(projectDir, 'package.json'), '{}', 'utf-8');

    const result = await attachProject('project', createMemoryLogger(), {
      cwd: tmpDir,
      saveActive: () => {},
      appendRegistry: () => {},
    });

    expect(result.projectRoot).toBe(projectDir);
  });

  it('rejects missing project directories', async () => {
    await expect(attachProject(path.join(tmpDir, 'missing'), createMemoryLogger(), {
      saveActive: () => {},
      appendRegistry: () => {},
    })).rejects.toThrow(/does not exist/i);
  });

  it('rejects file paths', async () => {
    const filePath = path.join(tmpDir, 'file.txt');
    fs.writeFileSync(filePath, 'not a directory', 'utf-8');

    await expect(attachProject(filePath, createMemoryLogger(), {
      saveActive: () => {},
      appendRegistry: () => {},
    })).rejects.toThrow(/not a directory/i);
  });

  it('rejects directories that are not writable', async () => {
    await expect(attachProject(tmpDir, createMemoryLogger(), {
      probeWritable: () => false,
      saveActive: () => {},
      appendRegistry: () => {},
    })).rejects.toThrow(/not writable/i);
  });
});
