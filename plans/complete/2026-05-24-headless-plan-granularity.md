# Headless Plan Granularity

Created: 2026-05-24 11:30 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:32 Africa/Johannesburg

## Why

Headless-ready plans must be granular so a coder model receives bounded work and the reviewer can verify each unit against the approved why.

## Assumptions

- A granular headless step needs one task, a why, planned files, validation, and a stop condition.
- This slice validates the structure before later execution routing.
- Single-task coder isolation is the next related item.

## Checklist

- [x] Add headless granularity model.
- [x] Require per-step why, files, validation, and stop condition.
- [x] Flag broad or incomplete steps.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless granularity tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-granularity.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
