# Phase 0 Task Persistence

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/task-records.ts`
- `cleanclaw/core/task-records.test.ts`
- `cleanclaw/core/pipeline.ts`
- `plans/inprogress/2026-05-18-phase0-task-persistence.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`

## Summary

- Added project-local task record persistence under `.cleanclaw/tasks/<task-id>/`.
- Added helpers to save/load `state.json`.
- Added helpers to append/load `approval-records.json` and `why-alignment-records.json`.
- Wired pipeline startup to create a Phase 0 task state for each run.
- Recorded approved task why when workflow answers are present.
- Added focused tests for task state, approval records, and why-alignment record persistence.
- Updated the active plan with the completed Phase 0 persistence slice.

## Reason

- CleanClaw's preferred working method requires durable, project-local control records before execution becomes more agent-like.

## Validation

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
