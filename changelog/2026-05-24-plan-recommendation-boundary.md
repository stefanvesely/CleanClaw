# Plan Recommendation Boundary

Timestamp: 2026-05-24 11:14 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/plan-recommendation.ts`
- `cleanclaw/core/plan-recommendation.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-plan-recommendation-boundary.md`

## Summary

- Added recommendation logic that only recommends when the top plan is clearly ahead.
- Added fallback output for close tradeoffs so the user remains the decision-maker.
- Added tests for clear-winner, close-call, and formatting behavior.

## Reason

CleanClaw should help interpret plan comparisons without hiding uncertainty or taking control away from the user.

## Validation

- `npx.cmd vitest run cleanclaw/core/plan-recommendation.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
