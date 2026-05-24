# ProjectMap Freshness Prompts

Timestamp: 2026-05-24 19:25 Africa/Johannesburg

## Changed Files

- `cleanclaw/projectmap/freshness-decision.ts`
- `cleanclaw/projectmap/freshness-decision.test.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-projectmap-freshness-prompts.md`

## Summary

- Added ProjectMap freshness summary and action prompt helpers.
- Setup now reuses fresh ProjectMap state without rebuilding.
- Setup asks with numbered choices before building a missing ProjectMap.
- Setup asks with numbered choices before rebuilding, continuing with, or skipping a stale ProjectMap.

## Why

CleanClaw should inspire confidence by saying what it knows about project memory and asking before expensive or potentially confusing rebuild work.

## Validation

- `npx.cmd vitest run cleanclaw/projectmap/freshness-decision.test.ts cleanclaw/projectmap/manifest.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
