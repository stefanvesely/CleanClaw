import { describe, expect, it } from 'vitest';
import { createHeadlessBlockReport, formatHeadlessBlockReport } from './headless-block-report.js';

describe('headless block report', () => {
  it('creates a report with blocker and allowed next actions', () => {
    const report = createHeadlessBlockReport({
      taskId: 'task1',
      stepId: 'step-1',
      blocker: 'Jacob has not supplied designs.',
      whyItStopped: 'The approved plan requires designs before UI edits.',
      allowedNextActions: ['Ask Jacob for designs', 'Revise the plan', 'Cancel the task'],
      createdAt: '2026-05-24T09:43:00.000Z',
    });

    expect(report).toEqual({
      taskId: 'task1',
      stepId: 'step-1',
      blocker: 'Jacob has not supplied designs.',
      whyItStopped: 'The approved plan requires designs before UI edits.',
      allowedNextActions: ['Ask Jacob for designs', 'Revise the plan', 'Cancel the task'],
      createdAt: '2026-05-24T09:43:00.000Z',
    });
  });

  it('formats the blocker prominently with interaction choices', () => {
    const output = formatHeadlessBlockReport(createHeadlessBlockReport({
      taskId: 'task1',
      stepId: 'step-1',
      blocker: 'Jacob has not supplied designs.',
      whyItStopped: 'The approved plan requires designs before UI edits.',
      allowedNextActions: ['Ask Jacob for designs', 'Revise the plan'],
      createdAt: '2026-05-24T09:43:00.000Z',
    }));

    expect(output).toContain('BLOCKED: Jacob has not supplied designs.');
    expect(output).toContain('## What Should CleanClaw Do Next?');
    expect(output).toContain('1. Ask Jacob for designs');
    expect(output).toContain('2. Revise the plan');
  });
});
