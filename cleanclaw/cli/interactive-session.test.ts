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
    });
    expect(questions[0]).toBe('What are we working on today? ');
    expect(questions[1]).toContain("scope today's work");
    expect(logger.records.map(record => String(record.message)).join('\n')).toContain('I will ask what we are working on');
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
