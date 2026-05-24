import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { inferProjectStack } from './stack-inference.js';
import { persistSelectedStack, stackSelectionOptions } from './stack-selection.js';
import type { DetectedProjectMarker } from './project-markers.js';

describe('stack selection', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-stack-selection-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('formats inferred stack candidates as numbered prompt options', () => {
    const options = stackSelectionOptions(inferProjectStack([
      marker('Node package', 'package.json', 'node'),
      marker('Next.js config', 'next.config.js', 'framework'),
    ]));

    expect(options[0]).toMatchObject({
      id: 'nextjs',
      label: 'nextjs (medium confidence)',
      recommended: true,
    });
    expect(options[0].description).toContain('next.config.js (Next.js config)');
    expect(options.at(-1)).toMatchObject({
      id: 'override',
      label: 'Use another stack',
    });
  });

  it('persists a selected stack in project settings', () => {
    const settings = persistSelectedStack({
      projectRoot: tmpDir,
      stack: 'python',
      updatedAt: '2026-05-24T00:00:00.000Z',
    });

    expect(settings.selectedStack).toBe('python');
    expect(fs.readFileSync(path.join(tmpDir, '.cleanclaw', 'settings.json'), 'utf-8'))
      .toContain('"selectedStack": "python"');
  });
});

function marker(
  label: DetectedProjectMarker['label'],
  relativePath: string,
  kind: DetectedProjectMarker['kind'],
): DetectedProjectMarker {
  return {
    label,
    relativePath,
    kind,
    absolutePath: `/repo/${relativePath}`,
  };
}
