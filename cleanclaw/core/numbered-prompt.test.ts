import { describe, expect, it } from 'vitest';
import { formatNumberedPrompt, parseNumberedPromptSelection, type NumberedPromptConfig } from './numbered-prompt.js';

describe('numbered prompt', () => {
  const config: NumberedPromptConfig = {
    question: 'What do you want to do?',
    defaultId: 'new-plan',
    allowNaturalLanguage: true,
    options: [
      {
        id: 'new-plan',
        label: 'Start a new task plan',
        description: 'Create a controlled plan before execution.',
        recommended: true,
      },
      {
        id: 'project-question',
        label: 'Ask a project question',
      },
    ],
  };

  it('formats a plain numbered prompt with default and recommendation text', () => {
    const output = formatNumberedPrompt(config);

    expect(output).toContain('What do you want to do?');
    expect(output).toContain('1. Start a new task plan (recommended)');
    expect(output).toContain('Create a controlled plan before execution.');
    expect(output).toContain('2. Ask a project question');
    expect(output).toContain('Press Enter for: Start a new task plan');
    expect(output).toContain('You can also type what you want in plain language.');
    expect(output.endsWith('\n')).toBe(true);
  });

  it('selects an option by number', () => {
    expect(parseNumberedPromptSelection('2', config)).toEqual({
      kind: 'option',
      option: config.options[1],
    });
  });

  it('selects the default option on Enter', () => {
    expect(parseNumberedPromptSelection('', config)).toEqual({
      kind: 'option',
      option: config.options[0],
    });
  });

  it('selects an option by typed id', () => {
    expect(parseNumberedPromptSelection('project-question', config)).toEqual({
      kind: 'option',
      option: config.options[1],
    });
  });

  it('returns controls for back, cancel, and exit', () => {
    expect(parseNumberedPromptSelection('back', config)).toEqual({ kind: 'control', control: 'back' });
    expect(parseNumberedPromptSelection('c', config)).toEqual({ kind: 'control', control: 'cancel' });
    expect(parseNumberedPromptSelection('q', config)).toEqual({ kind: 'control', control: 'exit' });
  });

  it('returns natural language when enabled', () => {
    expect(parseNumberedPromptSelection('help me review the plans', config)).toEqual({
      kind: 'natural-language',
      text: 'help me review the plans',
    });
  });

  it('returns invalid for out-of-range numbers and unknown text when natural language is disabled', () => {
    expect(parseNumberedPromptSelection('9', config)).toEqual({
      kind: 'invalid',
      reason: 'Option number is out of range: 9',
    });

    expect(parseNumberedPromptSelection('something else', {
      ...config,
      allowNaturalLanguage: false,
    })).toEqual({
      kind: 'invalid',
      reason: 'Unknown option: something else',
    });
  });
});
