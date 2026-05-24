import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { preparePlanForHeadless } from './headless-plan-preparation.js';

describe('headless plan preparation', () => {
  let tmpDir: string;
  let planPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-headless-plan-'));
    planPath = path.join(tmpDir, 'plans', 'inprogress', '2026-05-24-fix-login-cache.md');
    fs.mkdirSync(path.dirname(planPath), { recursive: true });
    fs.writeFileSync(planPath, '# Fix login cache\nStatus: approved\n', 'utf-8');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('marks an approved plan ready when all headless preparation fields are present', () => {
    const result = preparePlanForHeadless({
      planPath,
      approvedWhy: 'Keep login reliable for support users.',
      scopeTreePath: '.cleanclaw/tasks/task1/scope-tree.json',
      riskLimits: ['Only edit approved login cache files.'],
      validationPolicy: ['Run npm.cmd run build:cleanclaw.'],
      storagePolicy: ['Write records under the project-local task folder.'],
      modelPolicy: {
        coder: 'local-small-code-model',
        reviewer: 'frontier-reviewer-model',
      },
      stopConditions: ['Stop if scope expansion is required.'],
      preparedBy: 'Mali',
      preparedAt: '2026-05-24T09:05:00.000Z',
    });

    const content = fs.readFileSync(planPath, 'utf-8');
    expect(result).toEqual({
      ready: true,
      statusBefore: 'approved',
      missing: [],
      planPath,
    });
    expect(content).toContain('Status: ready-for-execution');
    expect(content).toContain('## Headless Preparation');
    expect(content).toContain('Prepared by: Mali');
    expect(content).toContain('- Coder: local-small-code-model');
    expect(content).toContain('- Reviewer: frontier-reviewer-model');
  });

  it('does not mark a plan ready when required fields are missing', () => {
    const result = preparePlanForHeadless({
      planPath,
      approvedWhy: '',
      scopeTreePath: '',
      riskLimits: [],
      validationPolicy: [],
      storagePolicy: [],
      modelPolicy: {
        coder: '',
        reviewer: '',
      },
      stopConditions: [],
      preparedBy: '',
    });

    const content = fs.readFileSync(planPath, 'utf-8');
    expect(result.ready).toBe(false);
    expect(result.missing).toEqual([
      'approved why',
      'scope tree',
      'risk limits',
      'validation policy',
      'storage policy',
      'coder model role',
      'reviewer model role',
      'stop conditions',
      'prepared by',
    ]);
    expect(content).toContain('Status: approved');
    expect(content).not.toContain('## Headless Preparation');
  });

  it('requires approved status before headless preparation', () => {
    fs.writeFileSync(planPath, '# Fix login cache\nStatus: draft\n', 'utf-8');

    const result = preparePlanForHeadless({
      planPath,
      approvedWhy: 'Keep login reliable for support users.',
      scopeTreePath: '.cleanclaw/tasks/task1/scope-tree.json',
      riskLimits: ['Only edit approved login cache files.'],
      validationPolicy: ['Run npm.cmd run build:cleanclaw.'],
      storagePolicy: ['Write records under the project-local task folder.'],
      modelPolicy: {
        coder: 'local-small-code-model',
        reviewer: 'frontier-reviewer-model',
      },
      stopConditions: ['Stop if scope expansion is required.'],
      preparedBy: 'Mali',
    });

    expect(result.ready).toBe(false);
    expect(result.missing).toEqual(['approved plan status']);
    expect(fs.readFileSync(planPath, 'utf-8')).toContain('Status: draft');
  });
});
