# ProjectMap Embedding Freshness

Created: 2026-05-25 00:10 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 00:45 Africa/Johannesburg

## Why

ProjectMap vectors are tied to the embedding provider and model that created them. If those settings change, CleanClaw must not silently treat the old vector DB as fresh; it should explain the mismatch and ask before rebuilding.

## Assumptions

- Manifest metadata should store the embedding provider and model used for the most recent build/update.
- File freshness and embedding freshness can share the existing stale ProjectMap prompt.
- Embedding mismatch should prefer full rebuild over incremental update.

## Checklist

- [x] Store embedding provider/model in the ProjectMap manifest.
- [x] Detect embedding provider/model mismatch during freshness inspection.
- [x] Prefer rebuild when stale because embeddings changed.
- [x] Add/update focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused ProjectMap manifest and freshness tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/projectmap/manifest.test.ts cleanclaw/projectmap/freshness-decision.test.ts cleanclaw/projectmap/updater-worker.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
