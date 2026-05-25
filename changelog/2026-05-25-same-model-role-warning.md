# Same Model Role Warning

Timestamp: 2026-05-25 01:06 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-model-role-policy.ts`
- `cleanclaw/core/headless-model-role-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-same-model-role-warning.md`

## Summary

- Added a headless model-role policy helper for coder/reviewer model pairing.
- Distinct coder and reviewer models pass without warning.
- Same-model coder/reviewer use requires explicit approval text.
- Approved same-model use records reduced review independence in `model-routing.md` and `approval-records.json`.

## Why

CleanClaw can allow same-model review when the user chooses it, but it must make the independence tradeoff visible and durable.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-model-role-policy.test.ts cleanclaw/core/headless-model-roles.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
