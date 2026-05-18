# Status Task Records

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/task-records.ts`
- `cleanclaw/core/task-records.test.ts`
- `cleanclaw/cli/show-status.ts`
- `plans/inprogress/2026-05-18-status-task-records.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`

## Summary

- Added task record summary helpers for listing task records and finding the latest task record.
- Added tests for latest task record summary behavior.
- Updated `cleanclaw status` to show latest task record directory, task lifecycle state, approved-why status, and scope tree path.
- Updated the active plan with the status progress.

## Reason

- Users need a quick way to see the new project-local control records without inspecting `.cleanclaw/tasks/` manually.

## Validation

- `npx.cmd vitest run cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
