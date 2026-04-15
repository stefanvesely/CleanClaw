import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendToRegistry, readRegistry } from './project-registry.js';

describe('project-registry', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-registry-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe('readRegistry', () => {
    it('returns [] when registry file does not exist', () => {
      expect(readRegistry(tmpDir)).toEqual([]);
    });

    it('returns entries after append', () => {
      appendToRegistry(tmpDir, 'MyProject', '/some/path');
      const entries = readRegistry(tmpDir);
      expect(entries).toHaveLength(1);
      expect(entries[0].name).toBe('MyProject');
      expect(entries[0].path).toBe('/some/path');
    });
  });

  describe('appendToRegistry', () => {
    it('adds a new entry', () => {
      appendToRegistry(tmpDir, 'Alpha', '/projects/alpha');
      expect(readRegistry(tmpDir)).toHaveLength(1);
    });

    it('does not duplicate entries with the same path', () => {
      appendToRegistry(tmpDir, 'Alpha', '/projects/alpha');
      appendToRegistry(tmpDir, 'Alpha', '/projects/alpha');
      expect(readRegistry(tmpDir)).toHaveLength(1);
    });

    it('adds two entries for different paths', () => {
      appendToRegistry(tmpDir, 'Alpha', '/projects/alpha');
      appendToRegistry(tmpDir, 'Beta', '/projects/beta');
      expect(readRegistry(tmpDir)).toHaveLength(2);
    });

    it('sets addedAt as an ISO date string', () => {
      appendToRegistry(tmpDir, 'Alpha', '/projects/alpha');
      const entry = readRegistry(tmpDir)[0];
      expect(() => new Date(entry!.addedAt)).not.toThrow();
      expect(entry!.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
