# Context Continuity

Timestamp: 2026-05-20 20:11 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/context-continuity.ts`
- `cleanclaw/core/context-continuity.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-context-continuity.md`

## Summary

- Added context continuity classification.
- Added `keep`, `separate`, and `confirm` decisions.
- Added user-visible context continuity formatting.
- Added basic keyword normalization so related wording like `cache` and `cached` stays connected.

## Reason

CleanClaw needs to decide whether the next task should keep, separate, or confirm context rather than silently carrying old assumptions forward.

## Validation

- `npx.cmd vitest run cleanclaw/core/context-continuity.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
