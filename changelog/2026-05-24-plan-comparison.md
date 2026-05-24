# Plan Comparison

Timestamp: 2026-05-24 11:11 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/plan-comparison.ts`
- `cleanclaw/core/plan-comparison.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-plan-comparison.md`

## Summary

- Added plan comparison inputs and results.
- Added balanced scoring across token cost, safety, speed, maintainability, risk, and scope size.
- Added tradeoff descriptions and numbered comparison formatting.
- Added focused tests for scoring, sorting, tradeoffs, and output formatting.

## Reason

CleanClaw should expose plan tradeoffs clearly before a user chooses what to approve or execute.

## Validation

- `npx.cmd vitest run cleanclaw/core/plan-comparison.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
