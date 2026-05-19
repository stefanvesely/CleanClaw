# Task-Scoped Broader Approval

Timestamp: 2026-05-19 17:27 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/control-contract.ts`
- `cleanclaw/core/control-contract.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-task-scoped-broader-approval.md`

## Summary

- Added task-scoped broader approval records for `per-file` and `per-step` modes.
- Added `approveBroaderApproval` with explicit user text enforcement.
- Added `expireBroaderApproval`.
- Updated task transitions so broader approval expires when a task reaches `done`.

## Reason

CleanClaw must only broaden approval when the user explicitly requests it, and that broader approval must not leak into later tasks.

## Validation

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
