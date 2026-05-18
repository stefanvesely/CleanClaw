import fs from 'fs';
import path from 'path';
import { ensureTaskRecordDir, taskRecordDir } from './task-records.js';

const SCOPE_TREE_FILE = 'scope-tree.json';

export interface OutOfRootRequest {
  path: string;
  reason: string;
  whyAlignment: 'aligned' | 'unclear' | 'misaligned';
  approved: boolean;
}

export interface ScopeTree {
  taskId: string;
  projectRoot: string;
  plannedReads: string[];
  plannedEdits: string[];
  plannedNewFiles: string[];
  validationCommands: string[];
  outOfRootRequests: OutOfRootRequest[];
  updatedAt: string;
}

export function createScopeTree(input: {
  taskId: string;
  projectRoot: string;
  plannedReads?: string[];
  plannedEdits?: string[];
  plannedNewFiles?: string[];
  validationCommands?: string[];
  outOfRootRequests?: OutOfRootRequest[];
  updatedAt?: string;
}): ScopeTree {
  const projectRoot = path.resolve(input.projectRoot);
  const plannedReads = normalizeProjectPaths(projectRoot, input.plannedReads ?? []);
  const plannedEdits = normalizeProjectPaths(projectRoot, input.plannedEdits ?? []);
  const plannedNewFiles = normalizeProjectPaths(projectRoot, input.plannedNewFiles ?? []);

  return {
    taskId: input.taskId,
    projectRoot,
    plannedReads: plannedReads.inRoot,
    plannedEdits: plannedEdits.inRoot,
    plannedNewFiles: plannedNewFiles.inRoot,
    validationCommands: unique(input.validationCommands ?? []),
    outOfRootRequests: [
      ...requestsFromPaths(plannedReads.outOfRoot, 'planned read'),
      ...requestsFromPaths(plannedEdits.outOfRoot, 'planned edit'),
      ...requestsFromPaths(plannedNewFiles.outOfRoot, 'planned new file'),
      ...(input.outOfRootRequests ?? []),
    ],
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export function saveScopeTree(projectRoot: string, scopeTree: ScopeTree): string {
  const dir = ensureTaskRecordDir(projectRoot, scopeTree.taskId);
  const filepath = path.join(dir, SCOPE_TREE_FILE);
  fs.writeFileSync(filepath, `${JSON.stringify(scopeTree, null, 2)}\n`, 'utf-8');
  return filepath;
}

export function loadScopeTree(projectRoot: string, taskId: string): ScopeTree | null {
  const filepath = path.join(taskRecordDir(projectRoot, taskId), SCOPE_TREE_FILE);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as ScopeTree;
}

export function formatScopeTree(scopeTree: ScopeTree): string {
  return [
    'Root directory',
    `  ${scopeTree.projectRoot}`,
    '',
    'Planned reads',
    formatList(scopeTree.plannedReads),
    '',
    'Planned edits',
    formatList(scopeTree.plannedEdits),
    '',
    'Planned new files',
    formatList(scopeTree.plannedNewFiles),
    '',
    'Validation commands',
    formatList(scopeTree.validationCommands),
    '',
    'Outside project root requests',
    formatOutOfRootRequests(scopeTree.outOfRootRequests),
  ].join('\n');
}

function normalizeProjectPaths(
  projectRoot: string,
  paths: string[],
): { inRoot: string[]; outOfRoot: string[] } {
  const inRoot: string[] = [];
  const outOfRoot: string[] = [];

  for (const entry of paths) {
    const normalized = normalizeProjectPath(projectRoot, entry);
    if (normalized.inRoot) {
      inRoot.push(normalized.path);
    } else {
      outOfRoot.push(normalized.path);
    }
  }

  return {
    inRoot: unique(inRoot),
    outOfRoot: unique(outOfRoot),
  };
}

function normalizeProjectPath(
  projectRoot: string,
  inputPath: string,
): { inRoot: true; path: string } | { inRoot: false; path: string } {
  const root = path.resolve(projectRoot);
  const resolved = path.isAbsolute(inputPath)
    ? path.resolve(inputPath)
    : path.resolve(root, inputPath);
  const relative = path.relative(root, resolved);
  const isInRoot = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));

  if (!isInRoot) {
    return { inRoot: false, path: resolved };
  }

  return { inRoot: true, path: normalizeSeparators(relative || '.') };
}

function requestsFromPaths(paths: string[], reason: string): OutOfRootRequest[] {
  return paths.map((entry) => ({
    path: entry,
    reason,
    whyAlignment: 'unclear',
    approved: false,
  }));
}

function formatList(items: string[]): string {
  if (items.length === 0) return '  - none';
  return items.map((item) => `  - ${item}`).join('\n');
}

function formatOutOfRootRequests(items: OutOfRootRequest[]): string {
  if (items.length === 0) return '  - none';
  return items
    .map((item) => `  - ${item.path} (${item.reason}; ${item.whyAlignment}; approved: ${item.approved})`)
    .join('\n');
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function normalizeSeparators(input: string): string {
  return input.split(path.sep).join('/');
}
