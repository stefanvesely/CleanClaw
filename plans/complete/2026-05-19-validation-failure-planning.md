# Validation Failure Planning

Created: 2026-05-19 17:43 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:33 Africa/Johannesburg

## Why

When validation fails, CleanClaw must make the failure visible and return to planning/update mode instead of continuing as if the task is safe.

## Assumptions

- Failure handling should be derived from validation records.
- The report should propose updating the plan, not automatically edit files.
- User interaction can be wired into the CLI/pipeline after the core report exists.

## Checklist

- [x] Add validation failure report type.
- [x] Summarize failed commands and next action.
- [x] Mark failed validation as requiring planning update.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused validation-record tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/validation-records.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
