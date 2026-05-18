# Project Local Settings

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Add `.cleanclaw/settings.json` as the project-local settings foundation for project root attachment and status output.

## Assumptions

- Keep global active-project pointer for now.
- Keep legacy `.cleanclaw-state.json` for resume/status compatibility.
- This slice writes/reads project-local settings but does not replace all config loading yet.

## Checklist

- [x] Add project settings helper.
- [x] Add tests for save/load/default settings.
- [x] Save settings during setup and project switching.
- [x] Show settings path/root in `cleanclaw status`.
- [x] Update plan/changelog, validate, commit.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`
