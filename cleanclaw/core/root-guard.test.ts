import path from 'path';
import { describe, expect, it } from 'vitest';
import { assertWithinProjectRoot, RootViolationError } from './root-guard.js';

const root = path.resolve('/project/myapp');

describe('assertWithinProjectRoot', () => {
  it('file inside root → no throw', () => {
    expect(() => assertWithinProjectRoot('/project/myapp/src/foo.ts', root)).not.toThrow();
  });

  it('file at root itself → no throw', () => {
    expect(() => assertWithinProjectRoot('/project/myapp', root)).not.toThrow();
  });

  it('file outside root → throws RootViolationError', () => {
    expect(() => assertWithinProjectRoot('/project/other/bar.ts', root))
      .toThrow(RootViolationError);
  });

  it('sibling directory with shared prefix → throws RootViolationError', () => {
    // "/project/myappExtra" starts with "/project/myapp" as a string
    // but is NOT inside it — the separator check must catch this
    expect(() => assertWithinProjectRoot('/project/myappExtra/baz.ts', root))
      .toThrow(RootViolationError);
  });

  it('error message includes both paths', () => {
    try {
      assertWithinProjectRoot('/project/other/bar.ts', root);
    } catch (e) {
      expect((e as Error).message).toContain('ROOT VIOLATION');
      expect((e as Error).message).toContain('other');
    }
  });
});
