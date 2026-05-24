# Multiple Approved Plans

Timestamp: 2026-05-24 11:00 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/session-plan.ts`
- `cleanclaw/core/session-plan.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-multiple-approved-plans.md`

## Summary

- Added `createApprovedSessionPlan()` for writing approved session plans.
- Reused the existing unique filename behavior so repeated approved plans for similar work are preserved side by side.
- Added coverage proving two approved plans do not overwrite each other.
- Marked the matching master-plan item complete.

## Reason

CleanClaw needs to support user-approved planning queues before execution, especially for later headless planning work.

## Validation

- `npx.cmd vitest run cleanclaw/core/session-plan.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
