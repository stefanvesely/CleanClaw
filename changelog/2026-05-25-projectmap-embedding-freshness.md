# ProjectMap Embedding Freshness

Timestamp: 2026-05-25 00:45 Africa/Johannesburg

## Changed Files

- `cleanclaw/projectmap/manifest.ts`
- `cleanclaw/projectmap/manifest.test.ts`
- `cleanclaw/projectmap/freshness-decision.ts`
- `cleanclaw/projectmap/freshness-decision.test.ts`
- `cleanclaw/projectmap/build.ts`
- `cleanclaw/projectmap/updater-worker.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-projectmap-embedding-freshness.md`

## Summary

- ProjectMap manifest now stores the embedding provider/model used for the latest build or update.
- Freshness inspection detects when the current embedding provider/model differs from the manifest.
- Stale ProjectMap prompts now default to full rebuild when embeddings changed.

## Why

Vectors built with one embedding model should not be silently treated as fresh under another model. CleanClaw needs to explain that mismatch and ask before rebuilding.

## Validation

- `npx.cmd vitest run cleanclaw/projectmap/manifest.test.ts cleanclaw/projectmap/freshness-decision.test.ts cleanclaw/projectmap/updater-worker.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
