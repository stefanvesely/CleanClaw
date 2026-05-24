# Plan Comparison

Created: 2026-05-24 11:12 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:11 Africa/Johannesburg

## Why

CleanClaw needs to show plan tradeoffs clearly so the user can choose with confidence instead of relying on hidden model preference.

## Assumptions

- Comparison should be explicit and inspectable.
- Lower token cost, lower risk, smaller scope, and higher safety/speed/maintainability are better.
- Recommendation logic belongs in the next slice.

## Checklist

- [x] Add plan comparison dimensions.
- [x] Add plan option input and comparison output.
- [x] Sort comparable plans by balanced score.
- [x] Format comparison output with numbered choices.
- [x] Add tests for scoring and formatting.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused plan comparison tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/plan-comparison.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
