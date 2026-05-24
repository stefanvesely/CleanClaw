# ProjectMap Stale Update Choice

Created: 2026-05-24 19:58 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 20:00 Africa/Johannesburg

## Why

When ProjectMap is stale, the most controlled choice is often to update only the changed files. CleanClaw should offer that path before a full rebuild, then reuse the incremental updater for changed, added, and deleted files.

## Assumptions

- The incremental updater now handles changed/new/deleted files and local embedding defaults.
- This slice wires setup-time stale ProjectMap choices only.
- Broader task-time ProjectMap status recording can remain a later state/scope-tree item.

## Checklist

- [x] Add `Update changed files only` as the first stale ProjectMap option.
- [x] Wire the option to the incremental updater.
- [x] Preserve rebuild, continue-stale, and skip options.
- [x] Add/update focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused ProjectMap freshness and updater tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/projectmap/freshness-decision.test.ts cleanclaw/projectmap/updater-worker.test.ts cleanclaw/projectmap/storage-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
