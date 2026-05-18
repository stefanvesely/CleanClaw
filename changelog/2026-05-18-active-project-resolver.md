# Active Project Resolver

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/project-resolver.ts`
- `cleanclaw/core/project-resolver.test.ts`
- `cleanclaw/cli/show-status.ts`
- `cleanclaw/cli/run-workflow.ts`
- `cleanclaw/core/pipeline.ts`
- `plans/inprogress/2026-05-18-active-project-resolver.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`

## Summary

- Added active project resolution that prefers current project-local settings.
- Added fallback to local `cleanclaw.config.json` marker.
- Kept global active-project pointer as fallback.
- Updated status to show how the active project was resolved.
- Updated workflow scanning and final state save to use the resolved active root.
- Updated pipeline ProjectMap/task-record/root lookups to use the resolved active root.
- Added tests for project settings, upward search, config marker, global fallback, and no-project cases.

## Reason

- CleanClaw should work naturally when launched inside a project folder and should not depend on typing `cleanclaw ...` from one exact directory.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-resolver.test.ts cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`
