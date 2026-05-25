# Project Preferences

Timestamp: 2026-05-25 21:49

## Why

CleanClaw should remember per-project workflow preferences while keeping granular approval as the default unless the user explicitly changes it.

## Changed Files

- `cleanclaw/core/project-settings.ts`
- `cleanclaw/core/project-settings.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-project-preferences.md`

## Summary

- Added project-local preferences for preferred plan style, runtime mode, and advanced option visibility.
- Preserved `per-change` approval as the default.
- Added `updateProjectPreferences()` to safely update workflow preferences without erasing selected stack or other settings.
- Marked the project preference master-plan item complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/project-settings.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
