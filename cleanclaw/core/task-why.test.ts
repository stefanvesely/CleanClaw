import { describe, expect, it } from 'vitest';
import { createApprovedTaskWhy, draftTaskWhy, normalizeTaskWhyText } from './task-why.js';

describe('task why intake', () => {
  it('drafts a project-specific why from the task', () => {
    expect(draftTaskWhy('Fix login cache', 'Demo')).toBe(
      'So Demo can safely complete this requested work with a clear purpose: Fix login cache.',
    );
  });

  it('normalizes whitespace', () => {
    expect(normalizeTaskWhyText('  Fix   login\ncache  ')).toBe('Fix login cache');
  });

  it('creates an approved why only when text exists', () => {
    expect(createApprovedTaskWhy('Keep auth reliable', 'yes')).toEqual({
      text: 'Keep auth reliable',
      approved: true,
      approvedByUserText: 'yes',
    });
    expect(createApprovedTaskWhy(' ', 'yes')).toBeNull();
  });
});
