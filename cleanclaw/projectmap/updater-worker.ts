import path from 'path';
import fs from 'fs';
import type { CleanClawConfig } from '../config/config-schema.js';
import { getProvider } from './embedder.js';
import { classifyFile } from './classifier.js';
import { extractMethods, embedTextForMethod, isCodeFile } from './extractor.js';
import { loadTable, saveTable } from './store.js';
import type { StoreRow } from './store.js';
import { writeProjectMapManifest } from './manifest.js';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';

const LAYERS = ['backend', 'frontend', 'mediator'] as const;
type Layer = (typeof LAYERS)[number];
const ALL_TABLES = [...LAYERS, 'misc'] as const;

export async function update(
  projectRoot: string,
  filePath: string,
  config: CleanClawConfig,
  logger: CleanClawLogger = createConsoleLogger(),
): Promise<void> {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
  const rel = normalizeRelativePath(path.relative(projectRoot, absolutePath));
  const storeDir = path.join(projectRoot, '.cleanclaw', 'projectmap');

  if (!fs.existsSync(absolutePath)) {
    const removed = removeFileFromProjectMapTables(storeDir, rel);
    writeProjectMapManifest(projectRoot);
    logger.warn(`[ProjectMap] File not found, removed ${removed} stale row${removed === 1 ? '' : 's'}: ${absolutePath}`);
    return;
  }

  if (!isCodeFile(absolutePath)) return;

  const layer = classifyFile(rel, config.layerMap ?? null, config.layerKeywords ?? null);
  if (!(LAYERS as readonly string[]).includes(layer)) return;

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const newRows = extractMethods(rel, content);
  const { rows: existing, vectors: existingVectors } = loadTable(storeDir, layer as Layer);

  const kept: StoreRow[] = [];
  const keptVectors: number[][] = [];
  for (let i = 0; i < existing.length; i++) {
    const row = existing[i] as { full_path?: string };
    if (row.full_path !== rel) {
      kept.push(existing[i]);
      if (existingVectors[i]) keptVectors.push(existingVectors[i]);
    }
  }

  if (newRows.length === 0) {
    saveTable(storeDir, layer as Layer, kept, keptVectors);
    writeProjectMapManifest(projectRoot);
    return;
  }

  const provider = await getProvider(config);
  const texts = newRows.map(embedTextForMethod);
  const newVectors = await provider.embed(texts);

  saveTable(storeDir, layer as Layer, [...kept, ...newRows], [...keptVectors, ...newVectors]);
  writeProjectMapManifest(projectRoot);
}

function removeFileFromProjectMapTables(storeDir: string, rel: string): number {
  let removed = 0;
  for (const table of ALL_TABLES) {
    const { rows, vectors } = loadTable(storeDir, table);
    if (rows.length === 0) continue;

    const kept: StoreRow[] = [];
    const keptVectors: number[][] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as { full_path?: string };
      if (row.full_path === rel) {
        removed++;
      } else {
        kept.push(rows[i]);
        if (vectors[i]) keptVectors.push(vectors[i]);
      }
    }

    if (kept.length !== rows.length) {
      saveTable(storeDir, table, kept, keptVectors);
    }
  }
  return removed;
}

function normalizeRelativePath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}
