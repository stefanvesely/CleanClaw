# Local-Only Model Guard

Timestamp: 2026-05-25 17:26

## Why

When a user chooses local-only work, CleanClaw must not silently fall back to frontier providers.

## Changed Files

- `cleanclaw/core/model-role-policy.ts`
- `cleanclaw/core/model-role-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-local-only-model-guard.md`

## Summary

- Added `localOnly` enforcement to the model role policy.
- Blocked non-local planner, coder, reviewer, local-coder, and embedding routes in local-only mode.
- Covered frontier default rejection and all-local success cases.
- Marked the local-only frontier guard master-plan item complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/model-role-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
