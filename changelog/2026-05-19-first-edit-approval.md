# First Edit Approval

Timestamp: 2026-05-19 17:21 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/control-contract.ts`
- `cleanclaw/core/control-contract.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-first-edit-approval.md`

## Summary

- Added first-edit approval to task state.
- Added `approveFirstEdit` and `assertFirstEditApproved`.
- Updated edit guards so approved file scope is not enough to edit until first-edit approval exists.
- Added focused tests for missing and approved first-edit approval.

## Reason

CleanClaw must always require explicit user approval before the first file edit of a plan.

## Validation

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
