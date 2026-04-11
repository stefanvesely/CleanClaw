import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writePlan } from './plan-writer.js';

describe('writePlan', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  const validContent = '## Objective\nDo something.\n\n## Steps\n1. Add a function — src/utils.ts\n\n## Scope Boundary\nOnly src/utils.ts.';

  it('creates the file with correct content', () => {
    writePlan('01', 'A', validContent, tmpDir);
    const written = fs.readFileSync(path.join(tmpDir, 'task01', 'task01A_plan.md'), 'utf-8');
    expect(written).toBe(validContent);
  });

  it('throws if the file already exists', () => {
    writePlan('01', 'A', validContent, tmpDir);
    expect(() => writePlan('01', 'A', validContent, tmpDir)).toThrow();
  });

  it('throws if the plan is missing ## Objective', () => {
    const content = '## Steps\n1. Add a function — src/utils.ts\n\n## Scope Boundary\nOnly src/utils.ts.';
    expect(() => writePlan('01', 'A', content, tmpDir)).toThrow(/Objective/);
  });

  it('creates the taskXX directory if it does not exist', () => {
    writePlan('02', 'A', validContent, tmpDir);
    expect(fs.existsSync(path.join(tmpDir, 'task02'))).toBe(true);
  });
});
