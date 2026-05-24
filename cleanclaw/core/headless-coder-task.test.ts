import { describe, expect, it } from 'vitest';
import { createHeadlessCoderTaskPackage, formatHeadlessCoderTaskPackage } from './headless-coder-task.js';
import type { HeadlessGranularStep } from './headless-granularity.js';

describe('headless coder task package', () => {
  const steps: HeadlessGranularStep[] = [
    {
      id: 'step-1',
      task: 'Update login cache timeout',
      why: 'Keep login reliable.',
      plannedFiles: ['src/auth/cache.ts'],
      validation: ['npm.cmd run build:cleanclaw'],
      stopCondition: 'Stop if another auth file needs edits.',
    },
    {
      id: 'step-2',
      task: 'Update login cache tests',
      why: 'Prove the cache timeout works.',
      plannedFiles: ['src/auth/cache.test.ts'],
      validation: ['npm.cmd test'],
      stopCondition: 'Stop if production code changes are required.',
    },
  ];

  it('packages only the selected step for the coder', () => {
    const taskPackage = createHeadlessCoderTaskPackage(steps, 'step-1');

    expect(taskPackage).toEqual({
      stepId: 'step-1',
      task: 'Update login cache timeout',
      why: 'Keep login reliable.',
      plannedFiles: ['src/auth/cache.ts'],
      validation: ['npm.cmd run build:cleanclaw'],
      stopCondition: 'Stop if another auth file needs edits.',
    });
    expect(JSON.stringify(taskPackage)).not.toContain('Update login cache tests');
  });

  it('throws when the requested step does not exist', () => {
    expect(() => createHeadlessCoderTaskPackage(steps, 'missing')).toThrow(/not found/i);
  });

  it('formats the package without sibling context', () => {
    const output = formatHeadlessCoderTaskPackage(createHeadlessCoderTaskPackage(steps, 'step-1'));

    expect(output).toContain('Step: step-1');
    expect(output).toContain('Task: Update login cache timeout');
    expect(output).not.toContain('step-2');
  });
});
