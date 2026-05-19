import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addFileToScopeTree,
  completeScopeTree,
  createScopeTree,
  formatScopeTree,
  formatWorkspaceScopeReview,
  isFileInScopeTree,
  isEditAllowedByScope,
  isNewFileAllowedByScope,
  isReadAllowedDuringPlanning,
  loadScopeTree,
  markScopeTreeWhyApproved,
  recordScopeTreeAppliedChange,
  recordScopeTreePreEditCheck,
  requiresOutOfRootApproval,
  saveScopeTree,
  setScopeTreeValidationCommands,
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
      lifecycle: {
        whyApproved: false,
        preEditChecks: 0,
        appliedChanges: 0,
        status: 'created',
        completedAt: null,
      },
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
    expect(formatScopeTree(tree)).toContain('Lifecycle');
    expect(formatScopeTree(tree)).toContain('status: created');
    expect(formatScopeTree(tree)).toContain('- README.md');
    expect(formatScopeTree(tree)).toContain('- src/index.ts');
    expect(formatScopeTree(tree)).toContain('- src/menu.ts');
    expect(formatScopeTree(tree)).toContain('- npm test');
  });

  it('formats workspace scope before generated plan for review', () => {
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
      plannedReads: ['README.md'],
    });

    const review = formatWorkspaceScopeReview({
      scopeTree: tree,
      planContent: '# Plan\n\n1. Update README',
      planPath: path.join(tmpDir, 'plans', 'task01A_plan.md'),
      stepCount: 1,
    });

    expect(review.indexOf('WORKSPACE SCOPE')).toBeLessThan(review.indexOf('GENERATED PLAN'));
    expect(review).toContain('- README.md');
    expect(review).toContain('Steps to execute: 1');
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

  it('expresses planning read and execution edit/new-file rules', () => {
    const outside = path.join(os.tmpdir(), 'outside.ts');
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
      plannedEdits: ['src/index.ts'],
      plannedNewFiles: ['src/new.ts'],
    });

    expect(isReadAllowedDuringPlanning(tree, 'src/index.ts')).toBe(true);
    expect(isReadAllowedDuringPlanning(tree, outside)).toBe(false);
    expect(isEditAllowedByScope(tree, 'src/index.ts')).toBe(true);
    expect(isEditAllowedByScope(tree, 'src/other.ts')).toBe(false);
    expect(isNewFileAllowedByScope(tree, 'src/new.ts')).toBe(true);
    expect(isNewFileAllowedByScope(tree, 'src/other-new.ts')).toBe(false);
    expect(requiresOutOfRootApproval(tree, outside)).toBe(true);
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
    expect(updated.lifecycle.status).toBe('scope-expanded');
  });

  it('updates lifecycle state for why, pre-edit, validation, applied changes, and completion', () => {
    const tree = createScopeTree({
      taskId: 'task-1',
      projectRoot: tmpDir,
      updatedAt: '2026-05-18T00:00:00.000Z',
    });

    const whyApproved = markScopeTreeWhyApproved(tree, '2026-05-18T00:01:00.000Z');
    const preEdit = recordScopeTreePreEditCheck(whyApproved, '2026-05-18T00:02:00.000Z');
    const validation = setScopeTreeValidationCommands(preEdit, ['npm test'], '2026-05-18T00:03:00.000Z');
    const applied = recordScopeTreeAppliedChange(validation, '2026-05-18T00:04:00.000Z');
    const completed = completeScopeTree(applied, '2026-05-18T00:05:00.000Z');

    expect(completed.lifecycle).toEqual({
      whyApproved: true,
      preEditChecks: 1,
      appliedChanges: 1,
      status: 'completed',
      completedAt: '2026-05-18T00:05:00.000Z',
    });
    expect(completed.validationCommands).toEqual(['npm test']);
    expect(completed.updatedAt).toBe('2026-05-18T00:05:00.000Z');
  });
});
