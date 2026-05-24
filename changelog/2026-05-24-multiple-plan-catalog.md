# Multiple Plan Catalog

Timestamp: 2026-05-24 11:07 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/plan-discovery.ts`
- `cleanclaw/core/plan-discovery.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-multiple-plan-catalog.md`

## Summary

- Added task-id extraction to in-progress plan summaries.
- Added grouped plan catalog helpers for multiple plans under the same task and across different tasks.
- Added grouped numbered formatting so the user can choose from visible options.
- Added coverage for grouped same-task and different-task plan discovery.

## Reason

CleanClaw needs to keep multiple plans visible and understandable before continuation or execution decisions.

## Validation

- `npx.cmd vitest run cleanclaw/core/plan-discovery.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
