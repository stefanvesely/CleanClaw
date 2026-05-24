import { describe, expect, it } from 'vitest';
import { createHeadlessStopReport } from './headless-stop-policy.js';

describe('headless stop policy', () => {
  it('creates a blocked report for scope violations', () => {
    const report = createHeadlessStopReport({
      taskId: 'task1',
      stepId: 'step-1',
      category: 'scope',
      detail: 'The coder needs to edit src/auth/session.ts, which is outside approved scope.',
      createdAt: '2026-05-24T09:46:00.000Z',
    });

    expect(report).toMatchObject({
      taskId: 'task1',
      stepId: 'step-1',
      blocker: 'Scope violation',
      whyItStopped: 'The coder needs to edit src/auth/session.ts, which is outside approved scope.',
      allowedNextActions: [
        'Review the blocker',
        'Revise the plan',
        'Approve a bounded scope or policy update',
        'Cancel the task',
      ],
    });
  });

  it('labels each stop category visibly', () => {
    expect(createHeadlessStopReport({
      taskId: 'task1',
      stepId: 'step-1',
      category: 'approved-plan',
      detail: 'Plan step is missing.',
    }).blocker).toBe('Approved Plan violation');

    expect(createHeadlessStopReport({
      taskId: 'task1',
      stepId: 'step-1',
      category: 'runtime-policy',
      detail: 'Runtime exceeded approved time limit.',
    }).blocker).toBe('Runtime Policy violation');
  });
});
