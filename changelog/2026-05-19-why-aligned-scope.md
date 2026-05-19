# Why-Aligned Scope

Timestamp: 2026-05-19 17:17 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/why-alignment.ts`
- `cleanclaw/core/why-alignment.test.ts`
- `cleanclaw/core/session-plan.ts`
- `cleanclaw/core/session-plan.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-why-aligned-scope.md`

## Summary

- Added a reusable why-alignment helper for proposed scope items.
- Added conservative aligned, unclear, and misaligned classification.
- Added formatting for visible scope why-alignment output.
- Updated draft plans to include proposed scope why-alignment.

## Reason

CleanClaw needs the approved why to filter proposed scope before the user is asked to approve files, directories, validation, or changes.

## Validation

- `npx.cmd vitest run cleanclaw/core/why-alignment.test.ts cleanclaw/core/session-plan.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
