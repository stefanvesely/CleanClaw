# Scope Expansion Pause

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Make CleanClaw pause when a proposed per-change edit targets a file that is not already in the visible scope tree.

## Assumptions

- This slice applies to the default per-change execution path.
- Headless execution should stop on scope expansion instead of approving it.
- Per-file execution can be aligned in a later slice.

## Checklist

- [x] Add scope tree membership/update helpers.
- [x] Add tests for detecting and adding edit/new-file scope.
- [x] Wire per-change pipeline to prompt before adding an out-of-scope file.
- [x] Update the active plan and changelog.
- [x] Run focused validation and build.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts`
- `npm.cmd run build:cleanclaw`

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts`
- `npm.cmd run build:cleanclaw`
