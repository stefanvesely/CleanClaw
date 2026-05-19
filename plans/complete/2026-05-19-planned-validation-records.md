# Planned Validation Records

Created: 2026-05-19 17:38 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:31 Africa/Johannesburg

## Why

After an approved change, CleanClaw should run already-approved validation commands without asking again, then record and summarize the result so the user knows what happened.

## Assumptions

- Validation commands must already be approved in task state.
- This slice adds the reusable validation runner and records; later pipeline wiring can call it after each approved change.
- Results should be stored project-locally under `.cleanclaw/tasks/<task-id>/`.

## Checklist

- [x] Add validation record types and formatting.
- [x] Add a runner that refuses unapproved validation commands.
- [x] Save JSON and Markdown validation records under task state.
- [x] Return a user-readable validation summary.
- [x] Add focused tests with a fake runner.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused validation-record tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/validation-records.test.ts cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
