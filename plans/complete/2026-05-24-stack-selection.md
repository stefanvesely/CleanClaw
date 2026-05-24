# Stack Selection

Created: 2026-05-24 18:42 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 18:42 Africa/Johannesburg

## Why

CleanClaw should ask the user to approve or override the inferred stack, then store the selected stack in project-local settings.

## Assumptions

- The inferred candidates come from `stack-inference.ts`.
- Selection should be compatible with numbered prompt options.
- Project settings can gain an optional `selectedStack` field without breaking existing settings.

## Checklist

- [x] Add selected stack to project settings.
- [x] Add stack selection prompt option formatter.
- [x] Add selected stack persistence helper.
- [x] Add tests for inferred selection and override persistence.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused stack selection/settings tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/stack-selection.test.ts cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
