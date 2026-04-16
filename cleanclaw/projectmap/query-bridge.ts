import { execFileSync } from 'child_process';
import path from 'path';
import type { CleanClawConfig } from '../config/config-schema.js';

export interface QueryResult {
  method_name?: string;
  signature?: string;
  output?: string;
  filename: string;
  full_path?: string;
  metadata?: string;
  algorithm?: string;
  purpose?: string;
  related_layer?: string;
}

const SCRIPT = path.resolve(
  new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
  '..', 'query.py'
);

export function queryProjectMap(
  text: string,
  projectRoot: string,
  config: CleanClawConfig,
  layers: string[] = ['backend', 'frontend', 'mediator'],
  topK = 10
): QueryResult[] {
  if (!config.projectMap?.enabled || !config.embeddings) return [];

  const storeDir = path.join(projectRoot, '.cleanclaw', 'projectmap');
  const configPath = path.join(projectRoot, 'cleanclaw.config.json');
  const results: QueryResult[] = [];

  for (const layer of layers) {
    try {
      const output = execFileSync('python', [
        SCRIPT,
        '--store-dir', storeDir,
        '--layer', layer,
        '--text', text,
        '--top-k', String(topK),
        '--config', configPath,
      ], { cwd: path.dirname(SCRIPT), encoding: 'utf-8' });
      const parsed = JSON.parse(output.trim()) as QueryResult[];
      results.push(...parsed);
    } catch {
      // Non-fatal — missing index or embedding failure never blocks the pipeline
      process.stderr.write(`[ProjectMap] Query failed for layer ${layer} — skipping.\n`);
    }
  }

  return results;
}
