# Multiple Approved Plans

Created: 2026-05-20 20:29 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:00 Africa/Johannesburg

## Why

CleanClaw should let users create multiple approved plans for later execution without overwriting existing plans.

## Assumptions

- Approved plans can live in `plans/inprogress/` until executed or completed.
- Unique filenames are enough for multiple plans in the first slice.
- The plan status should be explicit in the file.

## Checklist

- [x] Add approved session plan creation.
- [x] Preserve unique filenames for multiple approved plans.
- [x] Add tests for side-by-side approved plans.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused session-plan tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/session-plan.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
