# Status Task Records

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Update `cleanclaw status` so it shows project-local task record state, including latest task state and scope tree presence.

## Assumptions

- Keep legacy `.cleanclaw-state.json` support.
- Use `.cleanclaw/tasks/` as the new source for task-record visibility.
- Do not change active project discovery in this slice.

## Checklist

- [x] Add latest task record summary helper.
- [x] Update `cleanclaw status` output.
- [x] Add focused tests for task record summary.
- [x] Update plan/changelog.
- [x] Run validation and commit.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
