import path from 'path';
import { describe, expect, it } from 'vitest';
import { assertWithinProjectRoot, resolveProjectFilePath, RootViolationError } from './root-guard.js';

const root = path.resolve('/project/myapp');

describe('assertWithinProjectRoot', () => {
  it('allows files inside root', () => {
    expect(() => assertWithinProjectRoot('/project/myapp/src/foo.ts', root)).not.toThrow();
  });

  it('allows the root itself', () => {
    expect(() => assertWithinProjectRoot('/project/myapp', root)).not.toThrow();
  });

  it('resolves relative file paths against the active root', () => {
    expect(resolveProjectFilePath('src/foo.ts', root)).toBe(path.join(root, 'src', 'foo.ts'));
    expect(() => assertWithinProjectRoot('src/foo.ts', root)).not.toThrow();
  });

  it('rejects relative paths that escape the active root', () => {
    expect(() => assertWithinProjectRoot('../other/bar.ts', root)).toThrow(RootViolationError);
  });

  it('rejects files outside root', () => {
    expect(() => assertWithinProjectRoot('/project/other/bar.ts', root)).toThrow(RootViolationError);
  });

  it('rejects sibling directories with shared prefixes', () => {
    expect(() => assertWithinProjectRoot('/project/myappExtra/baz.ts', root)).toThrow(RootViolationError);
  });

  it('error message includes both paths', () => {
    try {
      assertWithinProjectRoot('/project/other/bar.ts', root);
    } catch (error) {
      expect((error as Error).message).toContain('ROOT VIOLATION');
      expect((error as Error).message).toContain('other');
    }
  });
});
