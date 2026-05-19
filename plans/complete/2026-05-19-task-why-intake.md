# Task Why Intake

Created: 2026-05-19 17:00 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:03 Africa/Johannesburg

## Why

CleanClaw needs an approved task why before scope and execution decisions so every later plan choice, file decision, validation step, and alignment check has a user-confirmed purpose.

## Assumptions

- CleanClaw may draft the why from the task and confirmed project.
- The user must approve or replace the why.
- This slice records the approved why in the interactive session result; task-state persistence can follow in a later slice.

## Checklist

- [x] Add a helper that drafts and normalizes task why text.
- [x] Ask the user to accept or replace the proposed why after project confirmation.
- [x] Add the approved why to the interactive session result.
- [x] Keep plan discovery and later planning behind a confirmed why.
- [x] Update focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused task-why and interactive-session tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/task-why.test.ts cleanclaw/core/project-intake.test.ts cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
