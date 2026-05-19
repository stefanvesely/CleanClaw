# Planned Validation Records

Timestamp: 2026-05-19 17:31 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/validation-records.ts`
- `cleanclaw/core/validation-records.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-planned-validation-records.md`

## Summary

- Added validation run records with pass/fail/skipped summaries.
- Added `runPlannedValidation`, which refuses unapproved validation commands.
- Added JSON and Markdown validation record storage under `.cleanclaw/tasks/<task-id>/`.
- Added focused tests using a fake command runner.

## Reason

After an approved change, CleanClaw should run already-approved validation without asking again and make the result visible in project-local records.

## Validation

- `npx.cmd vitest run cleanclaw/core/validation-records.test.ts cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
