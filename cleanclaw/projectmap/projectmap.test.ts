import { describe, expect, it } from 'vitest';
import { classifyFile } from './classifier.js';
import { embedTextForMethod, embedTextForMisc, extractMethods } from './extractor.js';
import type { MethodRow, MiscRow } from './extractor.js';

describe('classifyFile', () => {
  it('classifies backend by path segment', () => {
    expect(classifyFile('src/services/UserService.ts')).toBe('backend');
  });

  it('classifies frontend by path segment', () => {
    expect(classifyFile('src/components/Button.tsx')).toBe('frontend');
  });

  it('classifies mediator by path segment', () => {
    expect(classifyFile('src/controllers/ApiController.ts')).toBe('mediator');
  });

  it('falls back to misc for unrecognised path', () => {
    expect(classifyFile('README.md')).toBe('misc');
  });

  it('applies layerMap prefix override', () => {
    expect(classifyFile('src/custom/Foo.ts', { 'src/custom/': 'frontend' })).toBe('frontend');
  });

  it('applies extraKeywords override', () => {
    expect(classifyFile('src/warehouse/stock.ts', null, { backend: ['warehouse'] })).toBe('backend');
  });
});

describe('extractMethods', () => {
  it('extracts a TypeScript function', () => {
    const content = 'export function greet(name: string): string {\n  return `Hello ${name}`;\n}\n';
    const rows = extractMethods('src/greet.ts', content);
    expect(rows.some(r => r.method_name === 'greet')).toBe(true);
  });

  it('returns empty array for unsupported extension', () => {
    const rows = extractMethods('README.md', 'some text');
    expect(rows).toEqual([]);
  });
});

describe('embedTextForMethod', () => {
  it('includes method name and file path', () => {
    const row: MethodRow = {
      method_name: 'doThing',
      signature: 'doThing(x: number)',
      output: 'void',
      filename: 'foo.ts',
      full_path: 'src/foo.ts',
      metadata: '',
      algorithm: '',
    };
    const text = embedTextForMethod(row);
    expect(text).toContain('doThing');
    expect(text).toContain('src/foo.ts');
  });

  it('includes return type when present', () => {
    const row: MethodRow = {
      method_name: 'getUser',
      signature: 'getUser(id: number)',
      output: 'User',
      filename: 'user.ts',
      full_path: 'src/user.ts',
      metadata: '',
      algorithm: '',
    };
    const text = embedTextForMethod(row);
    expect(text).toContain('returns User');
  });
});

describe('embedTextForMisc', () => {
  it('includes filename', () => {
    const row: MiscRow = {
      filename: 'README.md',
      full_path: 'README.md',
      purpose: 'docs',
      related_layer: 'misc',
    };
    const text = embedTextForMisc(row);
    expect(text).toContain('README.md');
  });
});
