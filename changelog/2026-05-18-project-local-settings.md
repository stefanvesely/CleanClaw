# Project Local Settings

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/project-settings.ts`
- `cleanclaw/core/project-settings.test.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `cleanclaw/cli/switch-project.ts`
- `cleanclaw/cli/show-status.ts`
- `plans/inprogress/2026-05-18-project-local-settings.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`

## Summary

- Added `.cleanclaw/settings.json` project-local settings helpers.
- Added tests for settings defaults, save/load behavior, and non-overwriting ensure behavior.
- Updated setup to save project-local settings during project initialization.
- Updated project switching to ensure project-local settings exist.
- Updated status output to show settings path, root setting, and approval mode.
- Changed setup default approval granularity from `per-file` to `per-change`.

## Reason

- CleanClaw needs project-local settings as the foundation for root attachment and user-controlled project preferences.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`
