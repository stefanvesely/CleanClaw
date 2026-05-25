# Project Preferences

Created: 2026-05-25 21:48
Status: Complete
Completed: 2026-05-25 21:49

## Why

CleanClaw should remember user preferences per project so non-engineers are not repeatedly asked the same workflow questions, while granular approval remains the default unless explicitly changed.

## Assumptions

- Project-local `.cleanclaw/settings.json` remains the source of truth.
- Defaults should be conservative: per-change approval, guided plan style, ask runtime mode, advanced options hidden.
- Updating one preference must not erase existing project settings.

## Checklist

- [x] Add project preference fields to settings.
- [x] Add a safe preference update helper.
- [x] Preserve existing settings when updating one preference.
- [x] Add focused tests.
- [x] Mark the master-plan preference item complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/project-settings.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/project-settings.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
