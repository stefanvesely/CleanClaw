# Headless Block Report

Created: 2026-05-24 11:43 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:44 Africa/Johannesburg

## Why

When headless execution is blocked, CleanClaw must make the blocker obvious, invite user interaction, and leave a report that explains why it stopped.

## Assumptions

- This slice adds the report model and formatting.
- Persisting reports into task folders can come in the execution wiring slice.
- The report should include allowed next actions.

## Checklist

- [x] Add blocked headless report model.
- [x] Highlight blocker and blocked step.
- [x] Include user interaction choices.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless block report tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-block-report.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
