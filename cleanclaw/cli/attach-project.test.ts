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

  it('rejects missing project directories', async () => {
    await expect(attachProject(path.join(tmpDir, 'missing'), createMemoryLogger(), {
      saveActive: () => {},
      appendRegistry: () => {},
    })).rejects.toThrow(/does not exist/i);
  });
});
