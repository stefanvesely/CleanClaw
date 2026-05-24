# Headless Plan Granularity

Timestamp: 2026-05-24 11:32 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-granularity.ts`
- `cleanclaw/core/headless-granularity.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-headless-plan-granularity.md`

## Summary

- Added a headless granularity model for bounded execution steps.
- Required each step to include a task, why, planned files, validation, and stop condition.
- Flagged broad multi-action task wording.
- Added tests for valid granular steps, incomplete broad steps, and formatted failures.

## Reason

Headless-ready plans need bounded units so execution and review can stay inside the approved why and scope.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-granularity.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
