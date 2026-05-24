# Stack Selection

Timestamp: 2026-05-24 18:42 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/project-settings.ts`
- `cleanclaw/core/project-settings.test.ts`
- `cleanclaw/core/stack-selection.ts`
- `cleanclaw/core/stack-selection.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-stack-selection.md`

## Summary

- Added optional `selectedStack` to project-local settings.
- Added `saveSelectedStack()` to persist the chosen stack without changing existing approval preferences.
- Added stack selection option formatting from inferred stack candidates.
- Added tests for stack option formatting and project-local stack persistence.

## Reason

CleanClaw needs inferred stack selection to become a project-local preference after user confirmation.

## Validation

- `npx.cmd vitest run cleanclaw/core/stack-selection.test.ts cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
