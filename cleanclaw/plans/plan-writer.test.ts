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

  it('redacts secrets before writing a plan file', () => {
    const content = [
      '## Objective',
      'Use OPENAI_API_KEY=sk-123456789012345678901234 safely.',
      '',
      '## Steps',
      '1. Add a function â€” src/utils.ts',
      '',
      '## Scope Boundary',
      'Only src/utils.ts and nvapi-1234567890abcdef.',
    ].join('\n');

    writePlan('03', 'A', content, tmpDir);
    const written = fs.readFileSync(path.join(tmpDir, 'task03', 'task03A_plan.md'), 'utf-8');
    expect(written).toContain('<REDACTED>');
    expect(written).not.toContain('sk-123456789012345678901234');
    expect(written).not.toContain('nvapi-1234567890abcdef');
  });
});
