import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getConfigForProject } from './config-loader.js';

describe('CleanClaw config loader', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-config-loader-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loads project config from the provided project root', () => {
    fs.writeFileSync(path.join(tmpDir, 'cleanclaw.config.json'), JSON.stringify({
      projectName: 'Rooted Project',
      provider: 'openai-api',
      approvalGranularity: 'per-change',
      stack: 'typescript',
      plansDir: './plans',
      logFormat: 'json',
      openai: {
        model: 'gpt-test',
      },
    }), 'utf-8');

    expect(getConfigForProject(tmpDir)).toMatchObject({
      projectName: 'Rooted Project',
      provider: 'openai-api',
      approvalGranularity: 'per-change',
      stack: 'typescript',
      plansDir: './plans',
      logFormat: 'json',
      openai: {
        model: 'gpt-test',
      },
    });
  });

  it('falls back to defaults when project config is missing', () => {
    expect(getConfigForProject(tmpDir)).toMatchObject({
      plansDir: './plans',
      logFormat: 'markdown',
    });
  });
});
