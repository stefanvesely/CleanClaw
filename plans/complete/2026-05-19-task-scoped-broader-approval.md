# Task-Scoped Broader Approval

Created: 2026-05-19 17:34 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:27 Africa/Johannesburg

## Why

CleanClaw may only use broader approval when the user explicitly requests it, and broader approval must expire at the end of the current task.

## Assumptions

- `per-file` and `per-step` are broader than the default `per-change`.
- Broader approval should be visible in task state.
- Transitioning a task to `done` should clear broader approval and return the approval mode to `per-change`.

## Checklist

- [x] Add task-scoped broader approval state.
- [x] Add helper to approve broader approval only with explicit user text.
- [x] Add helper to expire broader approval.
- [x] Clear broader approval when a task reaches `done`.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused control-contract tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
