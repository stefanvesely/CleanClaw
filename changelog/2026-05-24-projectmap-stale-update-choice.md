# ProjectMap Stale Update Choice

Timestamp: 2026-05-24 20:00 Africa/Johannesburg

## Changed Files

- `cleanclaw/projectmap/freshness-decision.ts`
- `cleanclaw/projectmap/freshness-decision.test.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-projectmap-stale-update-choice.md`

## Summary

- Stale ProjectMap prompts now offer `Update changed files only` before full rebuild.
- The update option runs the incremental updater for changed, added, and deleted files from the freshness manifest.
- Rebuild, continue-stale, and skip options remain available.

## Why

The user should get the lowest-disruption ProjectMap refresh path first, with full rebuild still available when it is clearly needed.

## Validation

- `npx.cmd vitest run cleanclaw/projectmap/freshness-decision.test.ts cleanclaw/projectmap/updater-worker.test.ts cleanclaw/projectmap/storage-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
