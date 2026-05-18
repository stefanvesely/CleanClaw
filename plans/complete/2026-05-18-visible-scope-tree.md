# Visible Scope Tree

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Add the project-local scope tree foundation so every task can record the root directory, planned reads, planned edits, planned new files, validation commands, and out-of-root requests.

## Assumptions

- This slice only creates and saves the scope tree; enforcement can build on it next.
- Initial pipeline wiring can use scanned files as planned reads and confirmed files as planned edits.
- Validation commands remain empty until validation planning is implemented.

## Checklist

- [x] Add scope tree types and persistence helpers.
- [x] Add tests for save/load, path normalization, and out-of-root detection.
- [x] Wire initial scope tree into pipeline startup.
- [x] Update the main incomplete plan and changelog.
- [x] Run focused validation and build.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
