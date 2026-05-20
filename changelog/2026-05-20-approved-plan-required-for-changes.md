# Approved Plan Required For Changes

Timestamp: 2026-05-20 20:17 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/control-contract.ts`
- `cleanclaw/core/control-contract.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-approved-plan-required-for-changes.md`

## Summary

- Added approved-plan records to task state.
- Added `approvePlan` and `assertPlanApproved`.
- Updated edit guard checks so file changes require an approved plan before file scope and first-edit approval are considered.

## Reason

CleanClaw must prevent file changes unless they belong to a concrete approved plan.

## Validation

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
