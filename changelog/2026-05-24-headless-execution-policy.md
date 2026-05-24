# Headless Execution Policy

Timestamp: 2026-05-24 11:28 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-execution-policy.ts`
- `cleanclaw/core/headless-execution-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-headless-execution-policy.md`

## Summary

- Added a headless execution policy check.
- Required `ready-for-execution` plan status, explicit opt-in text, coder role, and reviewer role.
- Added tests for allowed execution, missing opt-in/roles, and non-ready plan rejection.

## Reason

Headless execution must remain opt-in and must have separate execution/review responsibility before it can run.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-execution-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
