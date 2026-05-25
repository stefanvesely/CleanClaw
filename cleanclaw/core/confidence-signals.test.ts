import { describe, expect, it } from 'vitest';
import { evaluateConfidenceSignals, type ConfidenceSignal } from './confidence-signals.js';

describe('confidence signals', () => {
  it('reports high confidence from confirmed practical signals', () => {
    const summary = evaluateConfidenceSignals([
      signal('project', 'Project confirmed', 'confirmed'),
      signal('why', 'Why aligned', 'confirmed'),
      signal('scope', 'File scope approved', 'confirmed'),
      signal('validation', 'Validation planned', 'confirmed'),
    ]);

    expect(summary.confidence).toBe('high');
    expect(summary.reasons).toEqual([
      'confirmed: Project confirmed, Why aligned, File scope approved, Validation planned',
    ]);
  });

  it('reports medium confidence when some details are inferred or missing', () => {
    const summary = evaluateConfidenceSignals([
      signal('project', 'Project confirmed', 'confirmed'),
      signal('why', 'Why aligned', 'confirmed'),
      signal('scope', 'File scope inferred', 'inferred'),
      signal('validation', 'Validation command missing', 'missing'),
    ]);

    expect(summary.confidence).toBe('medium');
    expect(summary.inferred.map(item => item.id)).toEqual(['scope']);
    expect(summary.missing.map(item => item.id)).toEqual(['validation']);
  });

  it('reports low confidence when a blocker exists', () => {
    const summary = evaluateConfidenceSignals([
      signal('project', 'Project confirmed', 'confirmed'),
      signal('designs', 'Jacob has not supplied designs', 'blocked'),
    ]);

    expect(summary.confidence).toBe('low');
    expect(summary.reasons).toContain('blocked: Jacob has not supplied designs');
  });

  it('reports unknown confidence when no signals are supplied', () => {
    expect(evaluateConfidenceSignals([])).toEqual({
      confidence: 'unknown',
      confirmed: [],
      inferred: [],
      missing: [],
      blocked: [],
      reasons: ['no practical confidence signals were supplied'],
    });
  });
});

function signal(id: string, label: string, status: ConfidenceSignal['status']): ConfidenceSignal {
  return {
    id,
    label,
    status,
    reason: `${label} is ${status}.`,
  };
}
