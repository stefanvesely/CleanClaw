# ProjectMap Incremental Maintenance

Timestamp: 2026-05-24 19:39 Africa/Johannesburg

## Changed Files

- `cleanclaw/projectmap/store.ts`
- `cleanclaw/projectmap/updater.ts`
- `cleanclaw/projectmap/updater-worker.ts`
- `cleanclaw/projectmap/updater-worker.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-projectmap-incremental-maintenance.md`

## Summary

- ProjectMap updates now run with local embedding defaults when `projectMap.enabled` is true and explicit `embeddings` config is absent.
- Deleted files are removed from backend, frontend, mediator, and misc ProjectMap tables.
- Empty ProjectMap tables can now be written, preventing stale rows from lingering when the last row is removed.
- Incremental updates refresh the ProjectMap manifest after changed, new, or deleted files are handled.

## Why

ProjectMap must stay aligned with the project after CleanClaw edits files, otherwise future planning uses stale memory and cannot explain what it knows.

## Validation

- `npx.cmd vitest run cleanclaw/projectmap/updater-worker.test.ts cleanclaw/projectmap/updater.test.ts cleanclaw/projectmap/manifest.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
