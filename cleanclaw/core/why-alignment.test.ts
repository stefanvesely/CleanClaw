import { describe, expect, it } from 'vitest';
import {
  assessScopeWhyAlignment,
  assessScopeWhyAlignments,
  formatScopeWhyAlignments,
} from './why-alignment.js';

const approvedWhy = {
  text: 'Keep login cache reliable for support users.',
  approved: true,
  approvedByUserText: 'yes',
};

describe('why alignment', () => {
  it('marks scope as aligned when rationale connects to approved why', () => {
    expect(assessScopeWhyAlignment({
      approvedWhy,
      item: {
        path: 'src/auth/login-cache.ts',
        kind: 'edit',
        rationale: 'Updates login cache behavior so support users get reliable auth state.',
      },
    })).toMatchObject({
      path: 'src/auth/login-cache.ts',
      result: 'aligned',
    });
  });

  it('marks scope as unclear when rationale is missing or disconnected', () => {
    expect(assessScopeWhyAlignment({
      approvedWhy,
      item: {
        path: 'src/theme/colors.ts',
        kind: 'edit',
        rationale: '',
      },
    }).result).toBe('unclear');

    expect(assessScopeWhyAlignment({
      approvedWhy,
      item: {
        path: 'src/theme/colors.ts',
        kind: 'edit',
        rationale: 'Adjust visual theme tokens.',
      },
    }).result).toBe('unclear');
  });

  it('marks explicit mismatch language as misaligned', () => {
    expect(assessScopeWhyAlignment({
      approvedWhy,
      item: {
        path: 'src/billing/invoice.ts',
        kind: 'edit',
        rationale: 'Different task, not related to login cache.',
      },
    }).result).toBe('misaligned');
  });

  it('formats multiple alignment records for plan output', () => {
    const alignments = assessScopeWhyAlignments({
      approvedWhy,
      items: [
        {
          path: 'src/auth/login-cache.ts',
          kind: 'edit',
          rationale: 'Updates login cache behavior.',
        },
      ],
    });

    expect(formatScopeWhyAlignments(alignments)).toContain('src/auth/login-cache.ts (edit): aligned');
  });
});
