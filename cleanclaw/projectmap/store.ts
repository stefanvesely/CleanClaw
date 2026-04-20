import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface MethodRow {
  method_name: string;
  signature: string;
  output: string;
  filename: string;
  full_path: string;
  metadata: string;
  algorithm: string;
}

export interface MiscRow {
  filename: string;
  full_path: string;
  purpose: string;
  related_layer: string;
}

export type StoreRow = MethodRow | MiscRow;

function indexPath(storeDir: string, layer: string): string {
  return join(storeDir, `${layer}.vectors.json`);
}

function metaPath(storeDir: string, layer: string): string {
  return join(storeDir, `${layer}.json`);
}

export interface LoadResult {
  vectors: number[][];
  rows: StoreRow[];
}

export function loadTable(storeDir: string, layer: string): LoadResult {
  const ip = indexPath(storeDir, layer);
  const mp = metaPath(storeDir, layer);
  if (!existsSync(ip) || !existsSync(mp)) {
    return { vectors: [], rows: [] };
  }
  const vectors = JSON.parse(readFileSync(ip, "utf-8")) as number[][];
  const rows = JSON.parse(readFileSync(mp, "utf-8")) as StoreRow[];
  return { vectors, rows };
}

export function saveTable(
  storeDir: string,
  layer: string,
  rows: StoreRow[],
  vectors: number[][]
): void {
  if (vectors.length === 0) return;
  mkdirSync(storeDir, { recursive: true });
  writeFileSync(indexPath(storeDir, layer), JSON.stringify(vectors, null, 2), "utf-8");
  writeFileSync(metaPath(storeDir, layer), JSON.stringify(rows, null, 2), "utf-8");
}

export function removeFileRows(
  storeDir: string,
  layer: string,
  fullPath: string
): { rows: StoreRow[]; positions: number[] } {
  const { rows: allRows } = loadTable(storeDir, layer);
  const rows: StoreRow[] = [];
  const positions: number[] = [];
  for (let i = 0; i < allRows.length; i++) {
    if ((allRows[i] as { full_path?: string }).full_path !== fullPath) {
      rows.push(allRows[i]);
      positions.push(i);
    }
  }
  return { rows, positions };
}

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function l2Norm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const na = l2Norm(a);
  const nb = l2Norm(b);
  if (na === 0 || nb === 0) return 0;
  return dotProduct(a, b) / (na * nb);
}

export function queryTable(
  storeDir: string,
  layer: string,
  queryVector: number[],
  topK = 10
): StoreRow[] {
  const { vectors, rows } = loadTable(storeDir, layer);
  if (vectors.length === 0) return [];

  const scored = vectors.map((v, i) => ({ score: cosineSimilarity(queryVector, v), i }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => rows[s.i]);
}
