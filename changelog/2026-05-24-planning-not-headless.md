# Planning Cannot Be Headless

Timestamp: 2026-05-24 11:25 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-planning-guard.ts`
- `cleanclaw/core/headless-planning-guard.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-planning-not-headless.md`

## Summary

- Added `assertPlanningIsInteractive()` for blocking headless planning phases.
- Added tests for allowed interactive planning and rejected headless planning.
- Updated the master plan to mark the planning-not-headless rule complete.

## Reason

The user must remain the planning link to the client before any headless execution can be prepared or run.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-planning-guard.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
