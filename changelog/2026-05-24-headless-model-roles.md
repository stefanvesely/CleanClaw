# Headless Model Roles

Timestamp: 2026-05-24 11:34 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-model-roles.ts`
- `cleanclaw/core/headless-model-roles.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-headless-model-roles.md`

## Summary

- Added headless model role validation.
- Required a coder role and a reviewer/reviewer-planner role with model values.
- Added tests for valid coder/reviewer, valid coder/reviewer-planner, and missing roles.

## Reason

Headless work needs distinct responsibilities for coding and review before execution can be trusted.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-model-roles.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
