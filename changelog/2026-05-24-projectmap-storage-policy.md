# ProjectMap Storage Policy

Timestamp: 2026-05-24 19:52 Africa/Johannesburg

## Changed Files

- `cleanclaw/projectmap/manifest.ts`
- `cleanclaw/projectmap/storage-policy.ts`
- `cleanclaw/projectmap/storage-policy.test.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-projectmap-storage-policy.md`

## Summary

- Added ProjectMap directory size inspection and storage-policy summaries.
- Added numbered over-threshold choices: commit anyway, keep local, compact/rebuild, or exclude folders.
- Manifest now records `lastSizeBytes` and persists the selected storage policy.
- Setup checks ProjectMap storage after reusing, building, or continuing with an existing ProjectMap.

## Why

ProjectMap should remain project-local memory, but CleanClaw must warn and ask when that memory grows beyond the 50 MB threshold.

## Validation

- `npx.cmd vitest run cleanclaw/projectmap/storage-policy.test.ts cleanclaw/projectmap/manifest.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
