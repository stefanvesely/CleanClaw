# Read-Only Project Questions

Created: 2026-05-20 20:16 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:15 Africa/Johannesburg

## Why

Users should be able to ask project questions before an execution plan exists, and CleanClaw must keep that mode read-only so no task records, plans, or file changes happen by accident.

## Assumptions

- The first slice should classify likely project questions and return a read-only session result.
- Read-only project questions still require confirmed project context.
- Actual answer generation can use richer project exploration later.

## Checklist

- [x] Add read-only project question classifier.
- [x] Add read-only session result mode.
- [x] Avoid task record and draft plan creation for read-only questions.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused interactive-session tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-question.test.ts cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
