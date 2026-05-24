import { describe, expect, it } from 'vitest';
import { checkHeadlessPlanGranularity, formatHeadlessGranularityResult } from './headless-granularity.js';

describe('headless plan granularity', () => {
  it('accepts bounded steps with task, why, files, validation, and stop condition', () => {
    const result = checkHeadlessPlanGranularity([
      {
        id: 'step-1',
        task: 'Update login cache timeout',
        why: 'Keep login reliable.',
        plannedFiles: ['src/auth/cache.ts'],
        validation: ['npm.cmd run build:cleanclaw'],
        stopCondition: 'Stop if another auth file needs edits.',
      },
    ]);

    expect(result).toEqual({
      granular: true,
      issues: [],
    });
  });

  it('flags incomplete or broad steps', () => {
    const result = checkHeadlessPlanGranularity([
      {
        id: 'step-1',
        task: 'Update login and refactor auth',
        why: '',
        plannedFiles: [],
        validation: [],
        stopCondition: '',
      },
    ]);

    expect(result.granular).toBe(false);
    expect(result.issues).toContain('step-1: missing step why.');
    expect(result.issues).toContain('step-1: missing planned files.');
    expect(result.issues).toContain('step-1: missing validation.');
    expect(result.issues).toContain('step-1: missing stop condition.');
    expect(result.issues).toContain('step-1: task appears to contain multiple actions.');
  });

  it('formats visible granularity failures', () => {
    const output = formatHeadlessGranularityResult(checkHeadlessPlanGranularity([]));

    expect(output).toContain('not granular enough');
    expect(output).toContain('Headless plan needs at least one granular step.');
  });
});
