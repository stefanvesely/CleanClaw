import path from 'path';
import fs from 'fs';
import type { CleanClawConfig } from '../config/config-schema.js';
import { getProvider } from './embedder.js';
import { classifyFile } from './classifier.js';
import { extractMethods, embedTextForMethod, isCodeFile } from './extractor.js';
import { loadTable, saveTable } from './store.js';
import type { StoreRow } from './store.js';

const LAYERS = ['backend', 'frontend', 'mediator'] as const;
type Layer = (typeof LAYERS)[number];

export async function update(projectRoot: string, filePath: string, config: CleanClawConfig): Promise<void> {
  if (!config.embeddings) return;

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);

  if (!fs.existsSync(absolutePath)) {
    process.stderr.write(`[ProjectMap] File not found, skipping index: ${absolutePath}\n`);
    return;
  }

  if (!isCodeFile(absolutePath)) return;

  const rel = path.relative(projectRoot, absolutePath);
  const layer = classifyFile(rel, config.layerMap ?? null, config.layerKeywords ?? null);
  if (!(LAYERS as readonly string[]).includes(layer)) return;

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const newRows = extractMethods(rel, content);
  if (newRows.length === 0) return;

  const storeDir = path.join(projectRoot, '.cleanclaw', 'projectmap');
  const { rows: existing, vectors: existingVectors } = loadTable(storeDir, layer as Layer);

  // Remove old rows for this file and keep their vectors
  const kept: StoreRow[] = [];
  const keptVectors: number[][] = [];
  for (let i = 0; i < existing.length; i++) {
    const row = existing[i] as { full_path?: string };
    if (row.full_path !== rel) {
      kept.push(existing[i]);
      keptVectors.push(existingVectors[i]);
    }
  }

  // Embed new rows and append
  const provider = await getProvider(config);
  const texts = newRows.map(embedTextForMethod);
  const newVectors = await provider.embed(texts);

  saveTable(storeDir, layer as Layer, [...kept, ...newRows], [...keptVectors, ...newVectors]);
}
