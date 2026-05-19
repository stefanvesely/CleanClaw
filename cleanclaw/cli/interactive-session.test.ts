import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryLogger } from '../core/logger.js';
import { createProjectSettings, saveProjectSettings } from '../core/project-settings.js';
import { startInteractiveSession } from './interactive-session.js';

describe('interactive session', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-interactive-session-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('asks for the task before confirming the detected project', async () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-19T00:00:00.000Z',
    }));
    const questions: string[] = [];
    const answers = ['Fix login cache', 'y'];
    const logger = createMemoryLogger();

    const result = await startInteractiveSession({
      cwd: tmpDir,
      logger,
      ask: async question => {
        questions.push(question);
        return answers.shift() ?? '';
      },
    });

    expect(result).toEqual({
      taskDescription: 'Fix login cache',
      projectRoot: path.resolve(tmpDir),
      projectConfirmed: true,
      planChoice: 'new',
      selectedPlan: null,
    });
    expect(questions[0]).toBe('What are we working on today? ');
    expect(questions[1]).toContain("scope today's work");
    expect(logger.records.map(record => String(record.message)).join('\n')).toContain('I will ask what we are working on');
  });

  it('discovers in-progress plans only after project confirmation', async () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-19T00:00:00.000Z',
    }));
    const inProgress = path.join(tmpDir, 'plans', 'inprogress');
    fs.mkdirSync(inProgress, { recursive: true });
    fs.writeFileSync(path.join(inProgress, '2026-05-19-demo.md'), [
      '# Demo Plan',
      'Status: In Progress',
      '',
      'Fix login cache behavior.',
    ].join('\n'), 'utf-8');
    const answers = ['Fix login cache', 'y', 'continue', 'y'];
    const logger = createMemoryLogger();

    const result = await startInteractiveSession({
      cwd: tmpDir,
      logger,
      ask: async () => answers.shift() ?? '',
    });

    expect(result.planChoice).toBe('continue');
    expect(result.selectedPlan?.title).toBe('Demo Plan');
    expect(logger.records.map(record => String(record.message)).join('\n')).toContain('I found 1 in-progress plan');
  });

  it('does not search in-progress plans when the project is not confirmed', async () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-19T00:00:00.000Z',
    }));
    const inProgress = path.join(tmpDir, 'plans', 'inprogress');
    fs.mkdirSync(inProgress, { recursive: true });
    fs.writeFileSync(path.join(inProgress, '2026-05-19-demo.md'), '# Demo Plan', 'utf-8');
    const logger = createMemoryLogger();

    const result = await startInteractiveSession({
      cwd: tmpDir,
      logger,
      ask: async question => question.includes('today') ? 'Fix login cache' : 'n',
    });

    expect(result.projectConfirmed).toBe(false);
    expect(result.planChoice).toBeNull();
    expect(logger.records.map(record => String(record.message)).join('\n')).not.toContain('in-progress plan');
  });

  it('does not change anything when no task is captured', async () => {
    const result = await startInteractiveSession({
      cwd: tmpDir,
      logger: createMemoryLogger(),
      ask: async () => '',
    });

    expect(result.taskDescription).toBeNull();
    expect(result.projectConfirmed).toBe(false);
  });
});
