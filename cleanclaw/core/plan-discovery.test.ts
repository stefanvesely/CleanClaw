import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  formatGroupedPlanChoices,
  formatInProgressPlanChoices,
  groupPlansByTask,
  listInProgressPlans,
} from './plan-discovery.js';

describe('in-progress plan discovery', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-plan-discovery-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns no plans when the confirmed project has no in-progress folder', () => {
    expect(listInProgressPlans(tmpDir)).toEqual([]);
  });

  it('summarizes markdown plans from the confirmed project only', () => {
    const inProgress = path.join(tmpDir, 'plans', 'inprogress');
    fs.mkdirSync(inProgress, { recursive: true });
    fs.writeFileSync(path.join(inProgress, '2026-05-19-demo.md'), [
      '# Demo Plan',
      'Status: In Progress',
      '',
      '## Goal',
      'Fix login cache behavior.',
    ].join('\n'), 'utf-8');
    fs.writeFileSync(path.join(inProgress, 'notes.txt'), 'ignore me', 'utf-8');

    const plans = listInProgressPlans(tmpDir);

    expect(plans).toHaveLength(1);
    expect(plans[0]).toMatchObject({
      filename: '2026-05-19-demo.md',
      title: 'Demo Plan',
      status: 'In Progress',
      taskId: 'unassigned',
    });
    expect(plans[0].preview).toContain('Fix login cache behavior');
  });

  it('formats numbered plan choices', () => {
    const inProgress = path.join(tmpDir, 'plans', 'inprogress');
    fs.mkdirSync(inProgress, { recursive: true });
    fs.writeFileSync(path.join(inProgress, '2026-05-19-demo.md'), '# Demo Plan\nStatus: In Progress\nBody', 'utf-8');

    const choices = formatInProgressPlanChoices(listInProgressPlans(tmpDir));

    expect(choices).toContain('1. Demo Plan');
    expect(choices).toContain('Status: In Progress');
  });

  it('excludes plans with status complete or cancelled', () => {
    const inProgress = path.join(tmpDir, 'plans', 'inprogress');
    fs.mkdirSync(inProgress, { recursive: true });
    fs.writeFileSync(path.join(inProgress, 'active.md'), '# Active Plan\nStatus: inprogress\n', 'utf-8');
    fs.writeFileSync(path.join(inProgress, 'done.md'), '# Done Plan\nStatus: complete\n', 'utf-8');
    fs.writeFileSync(path.join(inProgress, 'dropped.md'), '# Dropped Plan\nStatus: cancelled\n', 'utf-8');

    const plans = listInProgressPlans(tmpDir);

    expect(plans).toHaveLength(1);
    expect(plans[0].filename).toBe('active.md');
  });

  it('groups multiple plans for the same task and different tasks', () => {
    const inProgress = path.join(tmpDir, 'plans', 'inprogress');
    fs.mkdirSync(inProgress, { recursive: true });
    fs.writeFileSync(path.join(inProgress, '2026-05-19-login-low.md'), [
      '# Login Low Token',
      'Status: approved',
      'Task ID: task-login',
      '',
      'Low token fix.',
    ].join('\n'), 'utf-8');
    fs.writeFileSync(path.join(inProgress, '2026-05-19-login-full.md'), [
      '# Login Full Fix',
      'Status: approved',
      'Task ID: task-login',
      '',
      'Full fix.',
    ].join('\n'), 'utf-8');
    fs.writeFileSync(path.join(inProgress, '2026-05-19-search.md'), [
      '# Search Fix',
      'Status: approved',
      'Task ID: task-search',
      '',
      'Search fix.',
    ].join('\n'), 'utf-8');

    const groups = groupPlansByTask(listInProgressPlans(tmpDir));

    expect(groups).toHaveLength(2);
    expect(groups[0].taskId).toBe('task-login');
    expect(groups[0].plans.map(plan => plan.title)).toEqual(['Login Full Fix', 'Login Low Token']);
    expect(groups[1].taskId).toBe('task-search');
    expect(groups[1].plans.map(plan => plan.title)).toEqual(['Search Fix']);
  });

  it('formats grouped plan choices with continuous numbering', () => {
    const inProgress = path.join(tmpDir, 'plans', 'inprogress');
    fs.mkdirSync(inProgress, { recursive: true });
    fs.writeFileSync(path.join(inProgress, 'a.md'), '# A Plan\nStatus: approved\nTask ID: task-a\nA body', 'utf-8');
    fs.writeFileSync(path.join(inProgress, 'b.md'), '# B Plan\nStatus: approved\nTask ID: task-b\nB body', 'utf-8');

    const output = formatGroupedPlanChoices(groupPlansByTask(listInProgressPlans(tmpDir)));

    expect(output).toContain('Task: task-a');
    expect(output).toContain('1. A Plan');
    expect(output).toContain('Task: task-b');
    expect(output).toContain('2. B Plan');
  });
});
