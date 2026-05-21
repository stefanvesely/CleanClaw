import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { completePlan } from './plan-lifecycle.js';

describe('plan-lifecycle', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-plan-lifecycle-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('completePlan', () => {
    it('moves the file from inprogress to complete', () => {
      const inprogressDir = path.join(tmpDir, 'plans', 'inprogress');
      fs.mkdirSync(inprogressDir, { recursive: true });
      const src = path.join(inprogressDir, '2026-05-21-feature.md');
      fs.writeFileSync(src, '# Feature\nStatus: inprogress\n', 'utf-8');

      completePlan(tmpDir, src);

      expect(fs.existsSync(src)).toBe(false);
      expect(fs.existsSync(path.join(tmpDir, 'plans', 'complete', '2026-05-21-feature.md'))).toBe(true);
    });

    it('writes complete status into the file before moving', () => {
      const inprogressDir = path.join(tmpDir, 'plans', 'inprogress');
      fs.mkdirSync(inprogressDir, { recursive: true });
      const src = path.join(inprogressDir, '2026-05-21-feature.md');
      fs.writeFileSync(src, '# Feature\nStatus: inprogress\n', 'utf-8');

      completePlan(tmpDir, src);

      const dest = path.join(tmpDir, 'plans', 'complete', '2026-05-21-feature.md');
      const content = fs.readFileSync(dest, 'utf-8');
      expect(content).toContain('Status: complete');
    });

    it('creates the complete directory if it does not exist', () => {
      const inprogressDir = path.join(tmpDir, 'plans', 'inprogress');
      fs.mkdirSync(inprogressDir, { recursive: true });
      const src = path.join(inprogressDir, '2026-05-21-feature.md');
      fs.writeFileSync(src, '# Feature\nStatus: inprogress\n', 'utf-8');

      completePlan(tmpDir, src);

      expect(fs.existsSync(path.join(tmpDir, 'plans', 'complete'))).toBe(true);
    });

    it('returns the destination path', () => {
      const inprogressDir = path.join(tmpDir, 'plans', 'inprogress');
      fs.mkdirSync(inprogressDir, { recursive: true });
      const src = path.join(inprogressDir, '2026-05-21-feature.md');
      fs.writeFileSync(src, '# Feature\nStatus: inprogress\n', 'utf-8');

      const dest = completePlan(tmpDir, src);

      expect(dest).toBe(path.join(tmpDir, 'plans', 'complete', '2026-05-21-feature.md'));
    });
  });
});
