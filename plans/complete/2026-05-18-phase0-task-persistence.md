# Phase 0 Task Persistence

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Wire the Phase 0 control contract into project-local task records so CleanClaw starts writing `.cleanclaw/tasks/<task-id>/state.json` and approval/alignment logs.

## Assumptions

- Keep this slice small and compatible with the existing pipeline.
- Do not replace the old `.cleanclaw-state.json` resume state yet.
- Persist project-local records without changing the interactive approval UX in this slice.

## Checklist

- [x] Add task record persistence helpers.
- [x] Add tests for state, approval, and why-alignment persistence.
- [x] Wire pipeline task start to save task state.
- [x] Update the main incomplete plan and changelog.
- [x] Run focused validation.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
