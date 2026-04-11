import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendLogEntry } from './log-writer.js';
import type { ProposedChange } from '../core/language-agent.js';
import type { DiffCapture } from './diff-capture.js';

const proposed: ProposedChange = {
  filename: 'src/utils.ts',
  beforeLines: [{ lineNumber: 1, content: 'old line' }],
  afterLines: [{ lineNumber: 1, content: 'new line' }],
  explanation: 'Added validation',
};

const before: DiffCapture = {
  filename: 'src/utils.ts',
  lines: [{ lineNumber: 1, content: 'old line' }],
  isNewFile: false,
};

describe('appendLogEntry', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-log-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('first call creates the file with one entry', () => {
    appendLogEntry('01', 'A', 1, proposed, before, '[agent] Added validation', 'claude-haiku-4-5', tmpDir, 'markdown');
    const logPath = path.join(tmpDir, 'task01', 'task01A_log.md');
    expect(fs.existsSync(logPath)).toBe(true);
  });

  it('second call appends — file has both entries', () => {
    appendLogEntry('01', 'A', 1, proposed, before, '[agent] Added validation', 'claude-haiku-4-5', tmpDir, 'markdown');
    appendLogEntry('01', 'A', 2, proposed, before, '[user] Required by spec', 'claude-haiku-4-5', tmpDir, 'markdown');
    const content = fs.readFileSync(path.join(tmpDir, 'task01', 'task01A_log.md'), 'utf-8');
    expect(content).toContain('## Change 1');
    expect(content).toContain('## Change 2');
  });

  it('entry contains required sections', () => {
    appendLogEntry('01', 'A', 1, proposed, before, '[agent] Added validation', 'claude-haiku-4-5', tmpDir, 'markdown');
    const content = fs.readFileSync(path.join(tmpDir, 'task01', 'task01A_log.md'), 'utf-8');
    expect(content).toContain('**File:**');
    expect(content).toContain('**Before:**');
    expect(content).toContain('**After:**');
    expect(content).toContain('**Why:**');
    expect(content).toContain('**Model:**');
  });

  it('entries are in order — Change 1 before Change 2', () => {
    appendLogEntry('01', 'A', 1, proposed, before, '[agent] Added validation', 'claude-haiku-4-5', tmpDir, 'markdown');
    appendLogEntry('01', 'A', 2, proposed, before, '[user] Required by spec', 'claude-haiku-4-5', tmpDir, 'markdown');
    const content = fs.readFileSync(path.join(tmpDir, 'task01', 'task01A_log.md'), 'utf-8');
    expect(content.indexOf('## Change 1')).toBeLessThan(content.indexOf('## Change 2'));
  });
});
