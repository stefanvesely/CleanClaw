# Headless Stop Policy

Timestamp: 2026-05-24 11:46 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-stop-policy.ts`
- `cleanclaw/core/headless-stop-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-headless-stop-policy.md`

## Summary

- Added stop-policy categories for approved-plan, scope, why, model-policy, validation-policy, and runtime-policy violations.
- Added report creation that reuses the blocked headless report format.
- Included user-facing next actions for review, revision, bounded policy update, or cancellation.
- Added focused tests for scope violations and category labels.

## Reason

Headless execution must stop and report instead of improvising outside approved constraints.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-stop-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
