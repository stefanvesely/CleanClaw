# Headless Reviewer Decisions

Timestamp: 2026-05-24 11:41 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-reviewer-decision.ts`
- `cleanclaw/core/headless-reviewer-decision.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-headless-reviewer-decisions.md`

## Summary

- Added a bounded reviewer/planner decision gate for headless work.
- Allowed decisions only when they are in the approved option list and aligned with the why.
- Blocked out-of-option, unclear, and misaligned decisions.
- Added focused tests for allowed and blocked decisions.

## Reason

Reviewer/planner autonomy in headless mode must stay bounded by the user-approved why and explicit options.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-reviewer-decision.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
