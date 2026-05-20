# Blocked Work State

Timestamp: 2026-05-20 20:09 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/control-contract.ts`
- `cleanclaw/core/control-contract.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-blocked-work-state.md`

## Summary

- Added the `blocked` lifecycle state.
- Added task blocker records.
- Added `markTaskBlocked` and `formatBlockedWorkSummary`.
- Blocked tasks clear execution-only approvals, approved files, approved commands, and broader approval.
- Blocked tasks can be revised or cancelled.

## Reason

Blocked work must stop safely, highlight the blocker, and return control to the user instead of continuing with guesses.

## Validation

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/task-resume.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
