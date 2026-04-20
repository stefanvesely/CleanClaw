import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadTable, removeFileRows, saveTable } from './store.js';
import type { MethodRow } from './extractor.js';

describe('store', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-store-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  function makeRows(): MethodRow[] {
    return [
      {
        method_name: 'foo',
        filename: 'src/a.ts',
        full_path: '/p/src/a.ts',
        signature: 'foo(): void',
        output: 'void',
        metadata: '',
        algorithm: '',
      },
      {
        method_name: 'bar',
        filename: 'src/b.ts',
        full_path: '/p/src/b.ts',
        signature: 'bar(): string',
        output: 'string',
        metadata: '',
        algorithm: '',
      },
    ];
  }

  function makeVectors(count: number, dims = 8): number[][] {
    return Array.from({ length: count }, () =>
      Array.from({ length: dims }, () => Math.random())
    );
  }

  it('save and load roundtrip returns correct rows', () => {
    const rows = makeRows();
    const vectors = makeVectors(rows.length);
    saveTable(tmpDir, 'backend', rows, vectors);
    const { rows: loaded } = loadTable(tmpDir, 'backend');
    expect(loaded).toHaveLength(2);
    expect((loaded[0] as MethodRow).method_name).toBe('foo');
  });

  it('loadTable returns empty when files do not exist', () => {
    const { rows, vectors } = loadTable(tmpDir, 'missing');
    expect(rows).toEqual([]);
    expect(vectors).toEqual([]);
  });

  it('removeFileRows filters to correct entry', () => {
    const rows = makeRows();
    const vectors = makeVectors(rows.length);
    saveTable(tmpDir, 'backend', rows, vectors);
    const { rows: kept, positions } = removeFileRows(tmpDir, 'backend', '/p/src/a.ts');
    expect(kept).toHaveLength(1);
    expect(kept[0].filename).toBe('src/b.ts');
    expect(positions).toEqual([1]);
  });

  it('removeFileRows returns all rows when path does not match', () => {
    const rows = makeRows();
    const vectors = makeVectors(rows.length);
    saveTable(tmpDir, 'backend', rows, vectors);
    const { rows: kept } = removeFileRows(tmpDir, 'backend', '/p/src/nonexistent.ts');
    expect(kept).toHaveLength(2);
  });
});
