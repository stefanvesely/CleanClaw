# Approval Granularity After First Edit

Created: 2026-05-19 17:31 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:25 Africa/Johannesburg

## Why

CleanClaw should always be granular for the first edit, then use the project's saved approval-granularity preference only after that explicit first-edit approval exists.

## Assumptions

- Project settings already store approval granularity.
- The default remains `per-change`.
- Applying a broader mode should be explicit data passed into first-edit approval, not hidden behavior.

## Checklist

- [x] Add a helper to read approval mode from project settings.
- [x] Let first-edit approval switch the task approval mode after approval.
- [x] Keep default behavior granular when no mode is supplied.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused control-contract and project-settings tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
