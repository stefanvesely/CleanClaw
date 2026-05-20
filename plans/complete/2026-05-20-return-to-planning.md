# Return To Planning

Created: 2026-05-20 20:04 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:05 Africa/Johannesburg

## Why

After a task completes, CleanClaw should return to planning mode by default so the user stays in control of whether to continue, revise, start related work, or stop.

## Assumptions

- Completing a task should transition through the existing control contract.
- The return-to-planning summary should not infer the next task.
- Later work can use this summary for context-continuity decisions.

## Checklist

- [x] Add a completion-to-planning summary helper.
- [x] Complete eligible task states through `done`.
- [x] Produce a user-visible next planning prompt.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused completion-planning and control-contract tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/completion-planning.test.ts cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
