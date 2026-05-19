# Validation Failure Planning

Timestamp: 2026-05-19 17:33 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/validation-records.ts`
- `cleanclaw/core/validation-records.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-validation-failure-planning.md`

## Summary

- Added validation failure reports.
- Added failed-command summaries.
- Added formatting for visible blocked validation output.
- Marked failed validation as requiring planning/update mode.

## Reason

CleanClaw must not continue after validation failure without returning to planning, proposing a fix, and asking whether to update the plan.

## Validation

- `npx.cmd vitest run cleanclaw/core/validation-records.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
