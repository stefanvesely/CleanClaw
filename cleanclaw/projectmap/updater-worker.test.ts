import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProjectMapManifest, writeProjectMapManifest } from './manifest.js';
import { loadTable, saveTable } from './store.js';
import { update } from './updater-worker.js';
import type { CleanClawConfig } from '../config/config-schema.js';
import type { MethodRow, MiscRow } from './store.js';

vi.mock('./embedder.js', () => ({
  getProvider: vi.fn(async () => ({
    embed: vi.fn(async (texts: string[]) => texts.map((_, index) => [index + 1, index + 2])),
  })),
}));

describe('ProjectMap updater worker', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-projectmap-update-'));
    fs.mkdirSync(path.join(tmpDir, 'src', 'services'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('updates a code file using local embedding defaults when explicit embeddings config is absent', async () => {
    const filePath = path.join(tmpDir, 'src', 'services', 'user.ts');
    fs.writeFileSync(filePath, 'export function getUser(): string {\n  return "a";\n}\n', 'utf-8');

    await update(tmpDir, filePath, { projectMap: { enabled: true } } as CleanClawConfig);

    const { rows, vectors } = loadTable(path.join(tmpDir, '.cleanclaw', 'projectmap'), 'backend');
    expect(rows).toHaveLength(1);
    expect((rows[0] as MethodRow).method_name).toBe('getUser');
    expect(vectors).toEqual([[1, 2]]);
    expect(loadProjectMapManifest(tmpDir)?.files.map(file => file.path)).toEqual(['src/services/user.ts']);
  });

  it('removes deleted files from ProjectMap tables and refreshes the manifest', async () => {
    const storeDir = path.join(tmpDir, '.cleanclaw', 'projectmap');
    const oldPath = path.join(tmpDir, 'src', 'services', 'old.ts');
    const keptPath = path.join(tmpDir, 'src', 'services', 'kept.ts');
    fs.writeFileSync(oldPath, 'export function oldThing(): void {}\n', 'utf-8');
    fs.writeFileSync(keptPath, 'export function keptThing(): void {}\n', 'utf-8');

    const oldRow: MethodRow = {
      method_name: 'oldThing',
      signature: 'oldThing(): void',
      output: 'void',
      filename: 'old.ts',
      full_path: 'src/services/old.ts',
      metadata: '',
      algorithm: '',
    };
    const keptRow: MethodRow = {
      method_name: 'keptThing',
      signature: 'keptThing(): void',
      output: 'void',
      filename: 'kept.ts',
      full_path: 'src/services/kept.ts',
      metadata: '',
      algorithm: '',
    };
    const miscRow: MiscRow = {
      filename: 'old.ts',
      full_path: 'src/services/old.ts',
      purpose: '',
      related_layer: 'misc',
    };
    saveTable(storeDir, 'backend', [oldRow, keptRow], [[1], [2]]);
    saveTable(storeDir, 'misc', [miscRow], [[3]]);
    writeProjectMapManifest(tmpDir);
    fs.unlinkSync(oldPath);

    await update(tmpDir, oldPath, { projectMap: { enabled: true } } as CleanClawConfig);

    const backend = loadTable(storeDir, 'backend');
    const misc = loadTable(storeDir, 'misc');
    expect(backend.rows.map(row => row.full_path)).toEqual(['src/services/kept.ts']);
    expect(backend.vectors).toEqual([[2]]);
    expect(misc.rows).toEqual([]);
    expect(misc.vectors).toEqual([]);
    expect(loadProjectMapManifest(tmpDir)?.files.map(file => file.path)).toEqual(['src/services/kept.ts']);
  });
});
