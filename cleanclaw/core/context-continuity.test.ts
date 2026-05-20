import { describe, expect, it } from 'vitest';
import { assessContextContinuity, formatContextContinuityResult } from './context-continuity.js';

describe('context continuity', () => {
  it('keeps context when tasks are naturally related', () => {
    const result = assessContextContinuity({
      previousTask: 'Fix login cache behavior',
      nextTask: 'Store cached login data safely',
    });

    expect(result.decision).toBe('keep');
    expect(result.sharedTerms).toEqual(['login', 'cache']);
  });

  it('separates context when tasks are unrelated', () => {
    const result = assessContextContinuity({
      previousTask: 'Fix login cache behavior',
      nextTask: 'Build invoice export report',
    });

    expect(result.decision).toBe('separate');
    expect(result.sharedTerms).toEqual([]);
  });

  it('asks for confirmation when relationship is uncertain', () => {
    const result = assessContextContinuity({
      previousTask: 'Fix login cache behavior',
      nextTask: 'Update login page copy',
    });

    expect(result.decision).toBe('confirm');
    expect(formatContextContinuityResult(result)).toContain('CleanClaw should ask');
  });
});
