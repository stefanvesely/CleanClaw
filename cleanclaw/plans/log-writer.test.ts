import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendLogEntry, appendRollbackEntry, appendSessionHeader } from './log-writer.js';
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

  it('redacts secrets from markdown log entries', () => {
    const secretProposed: ProposedChange = {
      filename: 'src/utils.ts',
      beforeLines: [{ lineNumber: 1, content: 'Authorization: Bearer abcdefghijklmnop' }],
      afterLines: [{ lineNumber: 1, content: 'const key = "nvapi-1234567890abcdef";' }],
      explanation: 'Used OPENAI_API_KEY=sk-123456789012345678901234',
    };

    appendLogEntry(
      '01',
      'A',
      1,
      secretProposed,
      { ...before, lines: secretProposed.beforeLines },
      '[agent] token ghp_123456789012345678901234567890123456',
      'claude-haiku-4-5',
      tmpDir,
      'markdown',
    );

    const content = fs.readFileSync(path.join(tmpDir, 'task01', 'task01A_log.md'), 'utf-8');
    expect(content).toContain('<REDACTED>');
    expect(content).not.toContain('abcdefghijklmnop');
    expect(content).not.toContain('nvapi-1234567890abcdef');
    expect(content).not.toContain('ghp_123456789012345678901234567890123456');
  });

  it('redacts secrets from json log entries', () => {
    appendLogEntry(
      '01',
      'A',
      1,
      {
        ...proposed,
        afterLines: [{ lineNumber: 1, content: 'OPENAI_API_KEY=sk-123456789012345678901234' }],
        explanation: 'Call bearer token',
      },
      before,
      '[agent] Added env var',
      'claude-haiku-4-5',
      tmpDir,
      'json',
    );

    const content = fs.readFileSync(path.join(tmpDir, 'task01', 'task01A_log.json'), 'utf-8');
    expect(content).toContain('<REDACTED>');
    expect(content).not.toContain('sk-123456789012345678901234');
  });

  it('redacts secrets from session headers', () => {
    appendSessionHeader(
      'task01',
      'Wire up key nvapi-1234567890abcdef',
      {
        why: 'Authorization: Bearer abcdefghijklmnop',
        files: 'src/utils.ts',
        criteria: 'Do not persist sk-123456789012345678901234',
        outOfScope: 'No auth refactor',
      },
      ['src/utils.ts'],
      ['src/utils.ts'],
      'Use OPENAI_API_KEY=sk-123456789012345678901234 only from env.',
      tmpDir,
    );

    const content = fs.readFileSync(path.join(tmpDir, 'task01', 'task.log'), 'utf-8');
    expect(content).toContain('<REDACTED>');
    expect(content).not.toContain('nvapi-1234567890abcdef');
    expect(content).not.toContain('abcdefghijklmnop');
    expect(content).not.toContain('sk-123456789012345678901234');
  });

  it('redacts secrets from rollback entries', () => {
    appendRollbackEntry(
      '01',
      'A',
      ['src/OPENAI_API_KEY=sk-123456789012345678901234.ts'],
      tmpDir,
      'markdown',
    );

    const markdown = fs.readFileSync(path.join(tmpDir, 'task01', 'task01A_log.md'), 'utf-8');
    expect(markdown).toContain('<REDACTED>');
    expect(markdown).not.toContain('sk-123456789012345678901234');

    appendRollbackEntry(
      '02',
      'A',
      ['src/nvapi-1234567890abcdef.ts'],
      tmpDir,
      'json',
    );

    const json = fs.readFileSync(path.join(tmpDir, 'task02', 'task02A_log.json'), 'utf-8');
    expect(json).toContain('<REDACTED>');
    expect(json).not.toContain('nvapi-1234567890abcdef');
  });
});
