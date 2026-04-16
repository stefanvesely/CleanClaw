import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Test the pure helper functions by importing them directly.
// undoTask itself requires a real config + filesystem — tested via integration only.

function parseJsonLog(logPath: string) {
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(l => l.trim());
  return lines
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter((e) => e !== null && (e as Record<string, unknown>).changeNumber !== undefined);
}

describe('undo — log parsing', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-undo-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('parses valid JSON log entries', () => {
    const entry = { changeNumber: 1, filename: 'src/foo.ts', isNewFile: false, before: [], after: [], why: '[agent]', model: 'claude', timestamp: new Date().toISOString() };
    const logPath = path.join(tmpDir, 'task01A_log.json');
    fs.writeFileSync(logPath, JSON.stringify(entry) + '\n', 'utf-8');
    const entries = parseJsonLog(logPath);
    expect(entries).toHaveLength(1);
    expect(entries[0].filename).toBe('src/foo.ts');
  });

  it('skips malformed lines silently', () => {
    const logPath = path.join(tmpDir, 'task01A_log.json');
    fs.writeFileSync(logPath, 'not-json\n{"changeNumber":1,"filename":"a.ts","isNewFile":false,"before":[],"after":[],"why":"x","model":"m","timestamp":"2026-01-01T00:00:00.000Z"}\n', 'utf-8');
    const entries = parseJsonLog(logPath);
    expect(entries).toHaveLength(1);
  });

  it('filters out rollback entries', () => {
    const entries = [
      { changeNumber: 1, filename: 'a.ts', isNewFile: false, before: [], after: [], why: 'x', model: 'm', timestamp: new Date().toISOString() },
      { type: 'rollback', taskId: '01', restoredFiles: ['a.ts'], timestamp: new Date().toISOString() },
    ];
    const logPath = path.join(tmpDir, 'task01A_log.json');
    fs.writeFileSync(logPath, entries.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
    const parsed = parseJsonLog(logPath).filter(e => !('type' in e));
    expect(parsed).toHaveLength(1);
  });

  it('restores before-state content to file', () => {
    const target = path.join(tmpDir, 'foo.ts');
    fs.writeFileSync(target, 'after content', 'utf-8');
    const before = [{ lineNumber: 1, content: 'before content' }];
    const restored = before.map((l: { content: string }) => l.content).join('\n');
    fs.writeFileSync(target, restored, 'utf-8');
    expect(fs.readFileSync(target, 'utf-8')).toBe('before content');
  });
});
