# ProjectMap Freshness Manifest

Timestamp: 2026-05-24 19:12 Africa/Johannesburg

## Changed Files

- `cleanclaw/projectmap/manifest.ts`
- `cleanclaw/projectmap/manifest.test.ts`
- `cleanclaw/projectmap/build.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-projectmap-freshness-manifest.md`

## Summary

- Added a project-local ProjectMap manifest helper that writes `.cleanclaw/projectmap/manifest.json`.
- Manifest records project root, schema version, indexed source files, file sizes, modified times, file count, and the 50 MB storage warning threshold.
- Added freshness inspection that reports missing, fresh, or stale ProjectMap state with changed, added, deleted, and unchanged file lists.
- Full ProjectMap builds now write the manifest after indexing completes.

## Why

CleanClaw needs to reuse project memory only when it can explain that the memory matches the current project state. The manifest gives future planning and rebuild prompts a deterministic source of truth.

## Validation

- `npx.cmd vitest run cleanclaw/projectmap/manifest.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
