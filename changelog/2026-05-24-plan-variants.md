# Low Token And Full Fix Plan Variants

Timestamp: 2026-05-24 11:09 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/plan-variants.ts`
- `cleanclaw/core/plan-variants.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-plan-variants.md`

## Summary

- Added explicit `low-token-fix` and `full-fix` plan variant types.
- Added default variant descriptions, token profiles, recommendation contexts, and tradeoffs.
- Added numbered formatting for presenting variant choices to users.
- Added focused test coverage for default variants and formatted choices.

## Reason

CleanClaw should make scope and token tradeoffs visible before a user approves a plan.

## Validation

- `npx.cmd vitest run cleanclaw/core/plan-variants.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
