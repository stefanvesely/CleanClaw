# Blocked Work State

Created: 2026-05-20 20:10 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:09 Africa/Johannesburg

## Why

Blocked work needs to become a first-class state so CleanClaw stops safely, highlights the blocker, and returns to planning instead of guessing around missing input or unsafe conditions.

## Assumptions

- Blocked state is resumable, unlike `done` and `cancelled`.
- Entering blocked should clear execution-only approvals.
- A blocker summary should be plain-language and user-facing.

## Checklist

- [x] Add `blocked` lifecycle state.
- [x] Add blocker record to task state.
- [x] Add helper to mark a task blocked.
- [x] Clear execution-only approvals when work becomes blocked.
- [x] Add visible blocker summary formatter.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused control-contract and task-resume tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/task-resume.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
