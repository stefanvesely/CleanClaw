# Interactive Task Record

Created: 2026-05-19 17:05 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:07 Africa/Johannesburg

## Why

CleanClaw should write a project-local task record as soon as intake has a task, confirmed project, and approved why, so the user can see durable state before later planning and execution choices.

## Assumptions

- The first interactive task record should be saved after why approval.
- The saved lifecycle state should remain `why_definition` until scope planning is implemented.
- The record should live under the confirmed project only.

## Checklist

- [x] Add deterministic next-task-id support for project-local task records.
- [x] Save a task state from the interactive session after why approval.
- [x] Return the task id and state path from the interactive session.
- [x] Keep no-record behavior when task, project, or why is missing.
- [x] Update focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused task-records and interactive-session tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/task-records.test.ts cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
