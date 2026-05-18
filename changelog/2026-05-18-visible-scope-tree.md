# Visible Scope Tree

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/scope-tree.ts`
- `cleanclaw/core/scope-tree.test.ts`
- `cleanclaw/core/pipeline.ts`
- `plans/inprogress/2026-05-18-visible-scope-tree.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`

## Summary

- Added scope tree types and persistence helpers.
- Saved scope trees under `.cleanclaw/tasks/<task-id>/scope-tree.json`.
- Captured planned reads, planned edits, planned new files, validation commands, and out-of-root requests.
- Added human-readable scope tree formatting for future terminal/plan rendering.
- Wired pipeline startup to save the initial scope tree using scanned files as planned reads and confirmed files as planned edits.
- Added tests for scope tree save/load, path normalization, out-of-root detection, and formatting.

## Reason

- CleanClaw must show the user what is happening in near real time, beginning with a visible root/files scope before execution.

## Validation

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
