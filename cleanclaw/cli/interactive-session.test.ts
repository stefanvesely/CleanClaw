import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryLogger } from '../core/logger.js';
import { createProjectSettings, saveProjectSettings } from '../core/project-settings.js';
import { loadTaskState } from '../core/task-records.js';
import { startInteractiveLoop, startInteractiveSession } from './interactive-session.js';

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
      globalProject: null,
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
      taskWhy: {
        text: 'So Demo can safely complete this requested work with a clear purpose: Fix login cache.',
        approved: true,
        approvedByUserText: 'accepted proposed why',
      },
      taskId: 'task1',
      taskStatePath: path.join(tmpDir, '.cleanclaw', 'tasks', 'task1', 'state.json'),
      draftPlanPath: path.join(tmpDir, 'plans', 'inprogress', '2026-05-24-fix-login-cache.md'),
      mode: 'planning',
      planChoice: 'new',
      selectedPlan: null,
    });
    expect(questions[0]).toBe('What are we working on today? ');
    expect(questions[1]).toContain("scope today's work");
    expect(logger.records.map(record => String(record.message)).join('\n')).toContain('I will ask what we are working on');
    expect(loadTaskState(tmpDir, 'task1')).toMatchObject({
      state: 'why_definition',
      taskSummary: 'Fix login cache',
      why: {
        approved: true,
      },
    });
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
    const answers = ['Fix login cache', 'y', '', 'continue', 'y'];
    const logger = createMemoryLogger();

    const result = await startInteractiveSession({
      cwd: tmpDir,
      logger,
      ask: async () => answers.shift() ?? '',
    });

    expect(result.planChoice).toBe('continue');
    expect(result.taskWhy?.approved).toBe(true);
    expect(result.taskId).toBe('task1');
    expect(result.taskStatePath).toBe(path.join(tmpDir, '.cleanclaw', 'tasks', 'task1', 'state.json'));
    expect(result.draftPlanPath).toBeNull();
    expect(result.mode).toBe('planning');
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

  it('asks for a project directory when no project is detected', async () => {
    const projectDir = path.join(tmpDir, 'demo-project');
    fs.mkdirSync(projectDir);
    fs.writeFileSync(path.join(projectDir, 'package.json'), '{}', 'utf-8');
    const questions: string[] = [];
    const answers = ['Fix login cache', 'demo-project', 'y', 'Keep login reliable'];
    const logger = createMemoryLogger();

    const result = await startInteractiveSession({
      cwd: tmpDir,
      globalProject: null,
      logger,
      ask: async question => {
        questions.push(question);
        return answers.shift() ?? '';
      },
    });

    expect(result).toEqual({
      taskDescription: 'Fix login cache',
      projectRoot: projectDir,
      projectConfirmed: true,
      taskWhy: {
        text: 'Keep login reliable',
        approved: true,
        approvedByUserText: 'Keep login reliable',
      },
      taskId: 'task1',
      taskStatePath: path.join(projectDir, '.cleanclaw', 'tasks', 'task1', 'state.json'),
      draftPlanPath: path.join(projectDir, 'plans', 'inprogress', '2026-05-24-fix-login-cache.md'),
      mode: 'planning',
      planChoice: 'new',
      selectedPlan: null,
    });
    expect(questions).toContain('What project directory should CleanClaw use for this task? ');
    expect(logger.records.map(record => String(record.message)).join('\n')).toContain('package.json (Node package)');
  });

  it('asks for a replacement directory when the detected project is rejected', async () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Wrong Project',
      updatedAt: '2026-05-19T00:00:00.000Z',
    }));
    const correctProject = path.join(tmpDir, 'correct-project');
    fs.mkdirSync(correctProject);
    fs.writeFileSync(path.join(correctProject, 'package.json'), '{}', 'utf-8');
    const answers = ['Fix login cache', 'n', 'correct-project', 'y', ''];

    const result = await startInteractiveSession({
      cwd: tmpDir,
      logger: createMemoryLogger(),
      ask: async () => answers.shift() ?? '',
    });

    expect(result.projectRoot).toBe(correctProject);
    expect(result.projectConfirmed).toBe(true);
    expect(result.taskWhy?.approved).toBe(true);
    expect(result.taskId).toBe('task1');
    expect(result.draftPlanPath).toBe(path.join(correctProject, 'plans', 'inprogress', '2026-05-24-fix-login-cache.md'));
    expect(result.mode).toBe('planning');
    expect(result.planChoice).toBe('new');
  });

  it('handles project questions in read-only mode without task records or plans', async () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-20T00:00:00.000Z',
    }));
    const logger = createMemoryLogger();
    const answers = ['What stack does this project use?', 'y'];

    const result = await startInteractiveSession({
      cwd: tmpDir,
      globalProject: null,
      logger,
      ask: async () => answers.shift() ?? '',
    });

    expect(result).toMatchObject({
      taskDescription: 'What stack does this project use?',
      projectRoot: path.resolve(tmpDir),
      projectConfirmed: true,
      taskWhy: null,
      taskId: null,
      taskStatePath: null,
      draftPlanPath: null,
      mode: 'read-only-question',
      planChoice: null,
      selectedPlan: null,
    });
    expect(fs.existsSync(path.join(tmpDir, '.cleanclaw', 'tasks'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, 'plans', 'inprogress'))).toBe(false);
    expect(logger.records.map(record => String(record.message)).join('\n')).toContain('Read-only project question mode.');
  });

  it('does not change anything when no task is captured', async () => {
    const result = await startInteractiveSession({
      cwd: tmpDir,
      logger: createMemoryLogger(),
      ask: async () => '',
    });

    expect(result.taskDescription).toBeNull();
    expect(result.projectConfirmed).toBe(false);
    expect(result.mode).toBeNull();
  });

  it('keeps an active session open for another task until the user exits', async () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-24T00:00:00.000Z',
    }));
    const answers = [
      'Fix login cache', 'y', '', '', '', '',
      'What stack does this project use?', 'y', 'exit',
    ];

    const result = await startInteractiveLoop({
      cwd: tmpDir,
      globalProject: null,
      logger: createMemoryLogger(),
      ask: async () => answers.shift() ?? '',
      maxTurns: 3,
    });

    expect(result.exited).toBe(true);
    expect(result.sessions).toHaveLength(2);
    expect(result.sessions[0].mode).toBe('planning');
    expect(result.sessions[1].mode).toBe('read-only-question');
  });

  it('accepts natural language at the top-level numbered menu as the next task', async () => {
    saveProjectSettings(tmpDir, createProjectSettings({
      projectRoot: tmpDir,
      projectName: 'Demo',
      updatedAt: '2026-05-24T00:00:00.000Z',
    }));
    const answers = [
      'Fix login cache', 'y', '', '', '',
      'What stack does this project use?', 'y', '2',
    ];

    const result = await startInteractiveLoop({
      cwd: tmpDir,
      globalProject: null,
      logger: createMemoryLogger(),
      ask: async () => answers.shift() ?? '',
      maxTurns: 3,
    });

    expect(result.exited).toBe(true);
    expect(result.sessions).toHaveLength(2);
    expect(result.sessions[1].taskDescription).toBe('What stack does this project use?');
    expect(result.sessions[1].mode).toBe('read-only-question');
  });
});
