# First Edit Approval

Created: 2026-05-19 17:27 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:21 Africa/Johannesburg

## Why

CleanClaw must always require explicit user approval before the first file edit of a plan, regardless of later project approval-granularity settings.

## Assumptions

- The first-edit approval should be stored on task state so edit checks can enforce it.
- File-scope approval and first-edit approval are separate controls.
- Later work can add project-level granularity preferences after the first-edit gate exists.

## Checklist

- [x] Add first-edit approval state.
- [x] Add helper to record first-edit approval.
- [x] Require first-edit approval in edit guard checks.
- [x] Update focused tests.
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
