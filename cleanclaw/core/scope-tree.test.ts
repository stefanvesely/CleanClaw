import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addFileToScopeTree,
  createScopeTree,
  formatScopeTree,
  isFileInScopeTree,
  loadScopeTree,
  saveScopeTree,
} from './scope-tree.js';

describe('CleanClaw scope tree', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-scope-tree-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates a normalized project-local scope tree', () => {
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
      plannedReads: ['package.json', path.join(tmpDir, 'src', 'index.ts')],
      plannedEdits: ['src/index.ts', 'src/index.ts'],
      plannedNewFiles: ['src/menu.ts'],
      validationCommands: ['npm test'],
      updatedAt: '2026-05-18T00:00:00.000Z',
    });

    expect(tree).toMatchObject({
      taskId: 'task-1',
      projectRoot: path.resolve(tmpDir),
      plannedReads: ['package.json', 'src/index.ts'],
      plannedEdits: ['src/index.ts'],
      plannedNewFiles: ['src/menu.ts'],
      validationCommands: ['npm test'],
      outOfRootRequests: [],
      updatedAt: '2026-05-18T00:00:00.000Z',
    });
  });

  it('captures out-of-root files as approval requests', () => {
    const outside = path.join(os.tmpdir(), 'outside-cleanclaw-file.ts');
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
      plannedReads: [outside],
      plannedEdits: [path.join(tmpDir, 'src', 'index.ts')],
    });

    expect(tree.plannedReads).toEqual([]);
    expect(tree.plannedEdits).toEqual(['src/index.ts']);
    expect(tree.outOfRootRequests).toEqual([
      {
        path: path.resolve(outside),
        reason: 'planned read',
        whyAlignment: 'unclear',
        approved: false,
      },
    ]);
  });

  it('saves and loads scope tree from the task directory', () => {
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
      plannedReads: ['README.md'],
    });

    const filepath = saveScopeTree(tmpDir, tree);

    expect(filepath).toBe(path.join(tmpDir, '.cleanclaw', 'tasks', 'task-1', 'scope-tree.json'));
    expect(loadScopeTree(tmpDir, 'task-1')).toEqual(tree);
  });

  it('returns null for missing scope tree', () => {
    expect(loadScopeTree(tmpDir, 'missing-task')).toBeNull();
  });

  it('formats a human-visible tree', () => {
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
      plannedReads: ['README.md'],
      plannedEdits: ['src/index.ts'],
      plannedNewFiles: ['src/menu.ts'],
      validationCommands: ['npm test'],
      updatedAt: '2026-05-18T00:00:00.000Z',
    });

    expect(formatScopeTree(tree)).toContain('Root directory');
    expect(formatScopeTree(tree)).toContain('- README.md');
    expect(formatScopeTree(tree)).toContain('- src/index.ts');
    expect(formatScopeTree(tree)).toContain('- src/menu.ts');
    expect(formatScopeTree(tree)).toContain('- npm test');
  });

  it('detects whether a file is in editable scope', () => {
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
      plannedEdits: ['src/index.ts'],
      plannedNewFiles: ['src/menu.ts'],
    });

    expect(isFileInScopeTree(tree, 'src/index.ts')).toBe(true);
    expect(isFileInScopeTree(tree, path.join(tmpDir, 'src', 'menu.ts'))).toBe(true);
    expect(isFileInScopeTree(tree, 'src/other.ts')).toBe(false);
    expect(isFileInScopeTree(tree, path.join(os.tmpdir(), 'outside.ts'))).toBe(false);
  });

  it('adds an in-root file to edit or new-file scope', () => {
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
      updatedAt: '2026-05-18T00:00:00.000Z',
    });

    const withEdit = addFileToScopeTree(tree, 'src/index.ts', 'planned-edit', '2026-05-18T00:01:00.000Z');
    const withNewFile = addFileToScopeTree(withEdit, 'src/menu.ts', 'planned-new-file', '2026-05-18T00:02:00.000Z');

    expect(withNewFile.plannedEdits).toEqual(['src/index.ts']);
    expect(withNewFile.plannedNewFiles).toEqual(['src/menu.ts']);
    expect(withNewFile.updatedAt).toBe('2026-05-18T00:02:00.000Z');
  });

  it('records out-of-root additions as unapproved requests', () => {
    const outside = path.join(os.tmpdir(), 'outside-add.ts');
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
    });

    const updated = addFileToScopeTree(tree, outside, 'planned-edit', '2026-05-18T00:01:00.000Z');

    expect(updated.plannedEdits).toEqual([]);
    expect(updated.outOfRootRequests).toEqual([
      {
        path: path.resolve(outside),
        reason: 'planned-edit',
        whyAlignment: 'unclear',
        approved: false,
      },
    ]);
  });
});
