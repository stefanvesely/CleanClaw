import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { assertHeadlessExecutionAllowed, checkHeadlessExecutionPolicy } from './headless-execution-policy.js';

describe('headless execution policy', () => {
  let tmpDir: string;
  let planPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-headless-policy-'));
    planPath = path.join(tmpDir, 'plan.md');
    fs.writeFileSync(planPath, '# Plan\nStatus: ready-for-execution\n', 'utf-8');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('allows headless execution only when ready, opted in, and roles exist', () => {
    expect(checkHeadlessExecutionPolicy({
      planPath,
      optInUserText: 'run this plan headless',
      coderRole: 'frontier-coder',
      reviewerRole: 'frontier-reviewer',
    })).toEqual({
      allowed: true,
      missing: [],
    });
  });

  it('rejects missing opt-in and model roles', () => {
    expect(checkHeadlessExecutionPolicy({
      planPath,
      optInUserText: '',
      coderRole: '',
      reviewerRole: '',
    })).toEqual({
      allowed: false,
      missing: ['explicit headless opt-in', 'coder role', 'reviewer role'],
    });
  });

  it('rejects plans that are not ready for execution', () => {
    fs.writeFileSync(planPath, '# Plan\nStatus: approved\n', 'utf-8');

    expect(() => assertHeadlessExecutionAllowed({
      planPath,
      optInUserText: 'run this plan headless',
      coderRole: 'frontier-coder',
      reviewerRole: 'frontier-reviewer',
    })).toThrow(/ready-for-execution plan status/i);
  });
});
