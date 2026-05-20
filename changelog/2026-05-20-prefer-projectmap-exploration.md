# Prefer ProjectMap Exploration

Timestamp: 2026-05-20 20:22 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/project-exploration.ts`
- `cleanclaw/core/project-exploration.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-prefer-projectmap-exploration.md`

## Summary

- Added project exploration source decisions.
- Preferred ready ProjectMap when vector tables exist.
- Added fallback to approved scan or manual context when ProjectMap is missing or incomplete.

## Reason

CleanClaw should minimize broad scans by using project-local ProjectMap context whenever it is available.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-exploration.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
