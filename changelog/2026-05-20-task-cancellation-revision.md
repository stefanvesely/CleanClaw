# Task Cancellation And Revision

Timestamp: 2026-05-20 20:00 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/control-contract.ts`
- `cleanclaw/core/control-contract.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-task-cancellation-revision.md`

## Summary

- Added `revision` and `cancelled` lifecycle states.
- Added task cancellation and task revision records.
- Added `cancelTask` and `requestTaskRevision`.
- Revision clears execution-only approvals, approved files, approved commands, and broader approval.
- Cancellation is terminal and expires broader approval.

## Reason

Users must be able to stop or revise a task without hidden execution state carrying forward.

## Validation

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
