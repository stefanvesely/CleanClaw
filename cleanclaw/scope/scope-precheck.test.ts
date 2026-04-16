import { describe, expect, it } from 'vitest';
import { precheck } from './scope-precheck.js';
import type { ApprovedPlanContext } from './scope-rules.js';
import { CUMULATIVE_LIMIT } from './scope-rules.js';

const ctx: ApprovedPlanContext = {
  approvedFiles: ['src/foo.ts'],
  taskDescription: 'test task',
  planContent: 'plan',
};

const base = { filename: 'src/foo.ts', diff: '+const x = 1;', cumulativeChangeCount: 0 };

describe('precheck — inflection points', () => {
  it('iteration-start → check-silent', () => {
    const r = precheck({ ...base, isIterationStart: true }, ctx);
    expect(r.action).toBe('check-silent');
    expect(r.inflectionPoint).toBe('iteration-start');
    expect(r.resolved).toBe(true);
  });

  it('cumulative threshold → halt-confirm', () => {
    const r = precheck({ ...base, cumulativeChangeCount: CUMULATIVE_LIMIT }, ctx);
    expect(r.action).toBe('halt-confirm');
    expect(r.inflectionPoint).toBe('cumulative-threshold');
  });

  it('file not in approved plan → halt-confirm', () => {
    const r = precheck({ ...base, filename: 'src/other.ts' }, ctx);
    expect(r.action).toBe('halt-confirm');
    expect(r.inflectionPoint).toBe('out-of-plan-file');
  });
});

describe('precheck — change categories', () => {
  it('infra file → halt-confirm new-dependency', () => {
    const r = precheck({ ...base, filename: 'package.json' }, { ...ctx, approvedFiles: ['package.json'] });
    expect(r.action).toBe('halt-confirm');
    expect(r.category).toBe('new-dependency');
  });

  it('new import in diff → halt-confirm new-dependency', () => {
    const r = precheck({ ...base, diff: '+import fs from "fs";' }, ctx);
    expect(r.action).toBe('halt-confirm');
    expect(r.category).toBe('new-dependency');
  });

  it('whitespace-only diff → proceed structural', () => {
    const r = precheck({ ...base, diff: '+   \n+  // comment\n' }, ctx);
    expect(r.action).toBe('proceed');
    expect(r.category).toBe('structural');
  });

  it('pure declaration → proceed structural', () => {
    const r = precheck({ ...base, diff: '+interface Foo { name: string; }' }, ctx);
    expect(r.action).toBe('proceed');
    expect(r.category).toBe('structural');
  });

  it('new control flow → check-silent behavioural', () => {
    const r = precheck({ ...base, diff: '+if (x > 0) { return x; }' }, ctx);
    expect(r.action).toBe('check-silent');
    expect(r.category).toBe('behavioural');
  });

  it('ambiguous change → resolved false', () => {
    const r = precheck({ ...base, diff: '+const result = compute(a, b);' }, ctx);
    expect(r.resolved).toBe(false);
  });
});
