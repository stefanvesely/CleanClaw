import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryLogger } from '../core/logger.js';
import { createProjectSettings, saveProjectSettings } from '../core/project-settings.js';
import { showStatus } from './show-status.js';

describe('showStatus', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-show-status-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('shows project health for a settings-only attached project', async () => {
    fs.writeFileSync(path.join(tmpDir, 'cleanclaw.config.json'), '{}', 'utf-8');
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-18T00:00:00.000Z',
    }));
    fs.mkdirSync(path.join(tmpDir, '.cleanclaw', 'projectmap'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.cleanclaw', 'projectmap', 'backend.vectors.json'), '[[1]]', 'utf-8');

    const logger = createMemoryLogger();

    await showStatus(logger, {
      cwd: tmpDir,
      globalProject: null,
      openshellAvailable: true,
      env: {
        NEMOCLAW_SESSION_ID: 'session-1',
        NEMOCLAW_SANDBOX_NAME: 'demo-sandbox',
      },
    });

    const output = logger.records.map(record => String(record.message)).join('\n');
    expect(output).toContain('Active project: Demo');
    expect(output).toContain(`Active root:    ${path.resolve(tmpDir)}`);
    expect(output).toContain('Config:         cleanclaw.config.json');
    expect(output).toContain('ProjectMap:     ready');
    expect(output).toContain('Runtime:        NemoClaw context on host (demo-sandbox)');
    expect(output).toContain('Guardrails:     software root guard; OpenShell available, sandbox not active');
  });

  it('shows missing project map and software-only guardrails conservatively', async () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-18T00:00:00.000Z',
    }));

    const logger = createMemoryLogger();

    await showStatus(logger, {
      cwd: tmpDir,
      globalProject: null,
      openshellAvailable: false,
      env: {},
    });

    const output = logger.records.map(record => String(record.message)).join('\n');
    expect(output).toContain('Config:         missing');
    expect(output).toContain('ProjectMap:     missing');
    expect(output).toContain('Runtime:        standalone host');
    expect(output).toContain('Guardrails:     software root guard only; OpenShell unavailable');
  });
});
