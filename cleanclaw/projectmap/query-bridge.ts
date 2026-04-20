import path from 'path';
import type { CleanClawConfig } from '../config/config-schema.js';
import { getProvider } from './embedder.js';
import { queryTable } from './store.js';
import type { StoreRow } from './store.js';

export type QueryResult = StoreRow;

export async function queryProjectMap(
  text: string,
  projectRoot: string,
  config: CleanClawConfig,
  layers: string[] = ['backend', 'frontend', 'mediator'],
  topK = 10
): Promise<QueryResult[]> {
  if (!config.projectMap?.enabled || !config.embeddings) return [];

  const storeDir = path.join(projectRoot, '.cleanclaw', 'projectmap');
  const provider = await getProvider(config);
  const [queryVector] = await provider.embed([text]);
  const results: QueryResult[] = [];

  for (const layer of layers) {
    try {
      const rows = queryTable(storeDir, layer, queryVector, topK);
      results.push(...rows);
    } catch {
      // Non-fatal — missing index or embedding failure never blocks the pipeline
      process.stderr.write(`[ProjectMap] Query failed for layer ${layer} — skipping.\n`);
    }
  }

  return results;
}
