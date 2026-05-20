import { describe, expect, it } from 'vitest';
import { classifyProjectQuestion, formatProjectQuestionResponse } from './project-question.js';

describe('project questions', () => {
  it('classifies project questions as read-only', () => {
    expect(classifyProjectQuestion('What stack does this project use?')).toEqual({
      isProjectQuestion: true,
      reason: 'Input asks about project context and does not request a change.',
    });
  });

  it('classifies workflow and planning questions as read-only', () => {
    expect(classifyProjectQuestion('How does the approval workflow work?')).toMatchObject({
      isProjectQuestion: true,
    });
    expect(classifyProjectQuestion('Where is the validation plan recorded?')).toMatchObject({
      isProjectQuestion: true,
    });
  });

  it('does not classify change requests as project questions', () => {
    expect(classifyProjectQuestion('Fix the login cache')).toMatchObject({
      isProjectQuestion: false,
    });
  });

  it('formats read-only question mode output', () => {
    expect(formatProjectQuestionResponse('Where are plans stored?')).toContain('No files will be changed');
  });
});
