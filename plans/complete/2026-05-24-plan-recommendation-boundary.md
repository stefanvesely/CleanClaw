# Plan Recommendation Boundary

Created: 2026-05-24 11:14 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:14 Africa/Johannesburg

## Why

CleanClaw should help when one plan is clearly better, but it must not hide uncertainty or push the user when the tradeoffs are close.

## Assumptions

- Recommendation can be based on the comparison score gap.
- If the top two plans are close, CleanClaw should say there is no clear winner.
- The user remains the decision-maker either way.

## Checklist

- [x] Add recommendation decision helper.
- [x] Require a clear score gap before recommending.
- [x] Return no recommendation when scores are close.
- [x] Format recommendation output with tradeoff fallback.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused plan recommendation tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/plan-recommendation.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
