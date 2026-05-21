import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getPlanFilepath, readPlanStatus, writePlanStatus } from './plan-status.js';

describe('plan-status', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-plan-status-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('readPlanStatus', () => {
    it('returns the status from a plan file', () => {
      const file = path.join(tmpDir, 'plan.md');
      fs.writeFileSync(file, '# My Plan\nStatus: inprogress\n\nBody here.', 'utf-8');

      expect(readPlanStatus(file)).toBe('inprogress');
    });

    it('returns undefined when no Status line exists', () => {
      const file = path.join(tmpDir, 'plan.md');
      fs.writeFileSync(file, '# My Plan\n\nBody here.', 'utf-8');

      expect(readPlanStatus(file)).toBeUndefined();
    });

    it('returns undefined for unknown status values', () => {
      const file = path.join(tmpDir, 'plan.md');
      fs.writeFileSync(file, '# My Plan\nStatus: banana\n', 'utf-8');

      expect(readPlanStatus(file)).toBeUndefined();
    });

    it('normalizes whitespace and casing before matching', () => {
      const file = path.join(tmpDir, 'plan.md');
      fs.writeFileSync(file, '# My Plan\nStatus: Needs-User-Review\n', 'utf-8');

      expect(readPlanStatus(file)).toBe('needs-user-review');
    });
  });

  describe('writePlanStatus', () => {
    it('updates an existing Status line', () => {
      const file = path.join(tmpDir, 'plan.md');
      fs.writeFileSync(file, '# My Plan\nStatus: draft\n\nBody here.', 'utf-8');

      writePlanStatus(file, 'approved');

      const updated = fs.readFileSync(file, 'utf-8');
      expect(updated).toContain('Status: approved');
      expect(updated).not.toContain('Status: draft');
    });

    it('inserts Status after the title when no Status line exists', () => {
      const file = path.join(tmpDir, 'plan.md');
      fs.writeFileSync(file, '# My Plan\n\nBody here.', 'utf-8');

      writePlanStatus(file, 'blocked');

      const lines = fs.readFileSync(file, 'utf-8').split('\n');
      expect(lines[0]).toBe('# My Plan');
      expect(lines[1]).toBe('Status: blocked');
    });
  });

  describe('getPlanFilepath', () => {
    it('builds the correct path from projectRoot, folder, and filename', () => {
      const result = getPlanFilepath('/projects/myapp', 'inprogress', '2026-05-21-feature.md');

      expect(result).toBe(path.join('/projects/myapp', '.cleanclaw', 'plans', 'inprogress', '2026-05-21-feature.md'));
    });
  });
});
