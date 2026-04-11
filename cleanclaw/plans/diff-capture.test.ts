import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { captureBeforeState } from './diff-capture.js';

describe('captureBeforeState', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-diff-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('file does not exist → isNewFile: true, empty lines', () => {
    const result = captureBeforeState(path.join(tmpDir, 'new.ts'), [1, 2]);
    expect(result.isNewFile).toBe(true);
    expect(result.lines).toHaveLength(0);
  });

  it('file exists, request lines 1-3 → correct content returned', () => {
    const file = path.join(tmpDir, 'utils.ts');
    fs.writeFileSync(file, 'line one\nline two\nline three\n', 'utf-8');
    const result = captureBeforeState(file, [1, 2, 3]);
    expect(result.lines[0].content).toBe('line one');
    expect(result.lines[1].content).toBe('line two');
    expect(result.lines[2].content).toBe('line three');
  });

  it('file has 5 lines, request line 10 → no crash, returns annotation', () => {
    const file = path.join(tmpDir, 'short.ts');
    fs.writeFileSync(file, 'a\nb\nc\nd\ne\n', 'utf-8');
    const result = captureBeforeState(file, [10]);
    expect(result.lines[0].content).toMatch(/file ends at line/);
  });

  it('binary file extension → returns warning, no crash', () => {
    const file = path.join(tmpDir, 'image.png');
    fs.writeFileSync(file, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const result = captureBeforeState(file, [1]);
    expect(result.warning).toContain('Binary file');
    expect(result.lines).toHaveLength(0);
  });
});
