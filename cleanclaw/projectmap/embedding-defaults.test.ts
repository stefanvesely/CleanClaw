import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CleanClawConfig } from '../config/config-schema.js';
import { getProvider, LocalEmbeddingProvider } from './embedder.js';
import { queryProjectMap } from './query-bridge.js';
import { saveTable } from './store.js';
import type { MethodRow } from './store.js';

vi.mock('@xenova/transformers', () => ({
  pipeline: vi.fn(async () => async () => ({ data: [1, 0] })),
}));

describe('embedding defaults', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-query-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function baseConfig(): CleanClawConfig {
    return {
      provider: 'openai',
      approvalGranularity: 'per-file',
      logFormat: 'markdown',
      projectName: 'test-project',
      plansDir: './plans',
      stack: 'dotnet',
    };
  }

  it('uses the local embedding provider when embeddings config is omitted', async () => {
    const provider = await getProvider(baseConfig());
    expect(provider).toBeInstanceOf(LocalEmbeddingProvider);
  });

  it('queries ProjectMap with the local embedding fallback when embeddings config is omitted', async () => {
    const row: MethodRow = {
      method_name: 'doThing',
      signature: 'doThing(): void',
      output: 'void',
      filename: 'thing.ts',
      full_path: 'src/thing.ts',
      metadata: '',
      algorithm: '',
    };
    saveTable(path.join(tmpDir, '.cleanclaw', 'projectmap'), 'backend', [row], [[1, 0]]);

    const results = await queryProjectMap('find doThing', tmpDir, {
      ...baseConfig(),
      projectMap: { enabled: true },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ filename: 'thing.ts' });
  });

  it('does not query ProjectMap when projectMap is disabled', async () => {
    await expect(queryProjectMap('anything', tmpDir, baseConfig())).resolves.toEqual([]);
  });
});
