# Block Planning Edits

Timestamp: 2026-05-19 17:19 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/control-contract.ts`
- `cleanclaw/core/control-contract.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-block-planning-edits.md`

## Summary

- Added `assertTaskStateAllowsEdit`.
- Updated `assertCanEditFile` so edits are blocked unless the task is in `execution` or `review_diff`.
- Added tests proving planning-state edits are blocked while execution/review-diff edits can proceed to the existing scope checks.

## Reason

CleanClaw must keep planning and execution separate; known files or approved file lists must not be enough to edit before execution is approved.

## Validation

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
