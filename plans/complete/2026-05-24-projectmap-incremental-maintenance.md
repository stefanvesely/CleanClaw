# ProjectMap Incremental Maintenance

Created: 2026-05-24 19:31 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 19:39 Africa/Johannesburg

## Why

ProjectMap only inspires confidence if it stays current after CleanClaw changes files. Updated files should refresh their vectors, deleted files should be removed, and the manifest should reflect the new project state without requiring a full rebuild every time.

## Assumptions

- The current pipeline already calls `triggerProjectMapUpdate` after applied changes.
- This slice should make that existing hook useful for config with `projectMap.enabled` and no explicit `embeddings`.
- Broader user-facing stale ProjectMap update menus can follow after the updater is reliable.

## Checklist

- [x] Let updater use local embedding defaults when explicit embeddings config is absent.
- [x] Remove deleted files from ProjectMap tables.
- [x] Refresh the ProjectMap manifest after incremental updates.
- [x] Preserve non-blocking update failure behavior.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused updater tests.
- Run focused manifest tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/projectmap/updater-worker.test.ts cleanclaw/projectmap/updater.test.ts cleanclaw/projectmap/manifest.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
