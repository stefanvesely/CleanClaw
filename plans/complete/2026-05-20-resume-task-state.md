# Resume Task State

Created: 2026-05-20 20:02 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:03 Africa/Johannesburg

## Why

CleanClaw needs to load prior project-local task state so it can resume work with visible context instead of starting from scratch or guessing.

## Assumptions

- Done and cancelled tasks are terminal and should not be resumed.
- Revision tasks can be resumed because they are back in planning mode.
- The first slice should expose a core helper and readable summary; CLI wiring can build on it.

## Checklist

- [x] Add a resumable task-state helper.
- [x] Exclude terminal `done` and `cancelled` tasks.
- [x] Format a user-visible resume summary.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused task-resume and task-record tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/task-resume.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
