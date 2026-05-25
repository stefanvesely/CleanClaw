# Model Role Policy

Timestamp: 2026-05-25 17:21

## Why

CleanClaw needs explicit model roles so one active provider is not silently treated as planner, coder, reviewer, local coder, and embedding provider.

## Changed Files

- `cleanclaw/core/model-role-policy.ts`
- `cleanclaw/core/model-role-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-model-role-policy.md`

## Summary

- Added a model role policy helper with planner, coder, reviewer, local coder, and embedding roles.
- Defaulted planner and coder roles from the configured provider while preserving explicit role records.
- Required reviewer presence when review is required.
- Required local roles to use local providers.
- Marked the single-active-provider master-plan item complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/model-role-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
