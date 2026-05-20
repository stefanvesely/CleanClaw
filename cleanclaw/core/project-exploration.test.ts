import { describe, expect, it } from 'vitest';
import { chooseProjectExplorationSource, formatProjectExplorationDecision } from './project-exploration.js';

describe('project exploration source', () => {
  const baseProjectMap = {
    directory: '/repo/.cleanclaw/projectmap',
    fileCount: 0,
    vectorTableCount: 0,
  };

  it('prefers ProjectMap when it is ready', () => {
    const decision = chooseProjectExplorationSource({
      ...baseProjectMap,
      status: 'ready',
      fileCount: 2,
      vectorTableCount: 1,
    });

    expect(decision.source).toBe('projectmap');
    expect(formatProjectExplorationDecision(decision)).toContain('ProjectMap is ready');
  });

  it('falls back when ProjectMap is missing or incomplete', () => {
    expect(chooseProjectExplorationSource({
      ...baseProjectMap,
      status: 'missing',
    }).source).toBe('approved-scan-or-manual-context');

    expect(chooseProjectExplorationSource({
      ...baseProjectMap,
      status: 'registry-only',
      fileCount: 1,
    }).source).toBe('approved-scan-or-manual-context');
  });
});
