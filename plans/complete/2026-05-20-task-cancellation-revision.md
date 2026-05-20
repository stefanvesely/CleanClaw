# Task Cancellation And Revision

Created: 2026-05-20 00:00 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:00 Africa/Johannesburg

## Why

CleanClaw needs explicit cancellation and revision controls so the user can stop work or send it back to planning without hidden state carrying forward into unsafe execution.

## Assumptions

- Cancellation should be terminal.
- Revision should return the task to planning with execution-only approvals cleared.
- Revision should keep the task summary and approved why unless the user later edits them.

## Checklist

- [x] Add `revision` and `cancelled` lifecycle states.
- [x] Add cancellation and revision records to task state.
- [x] Add helpers to cancel a task and request revision.
- [x] Clear execution-only approvals when a task enters revision.
- [x] Add focused control-contract tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused control-contract and task-record tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
