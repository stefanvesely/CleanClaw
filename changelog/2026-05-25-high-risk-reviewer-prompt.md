# High-Risk Reviewer Prompt

Timestamp: 2026-05-25 17:19

## Why

High-risk work needs a visible user choice before CleanClaw asks a reviewer, revises the plan, or stops.

## Changed Files

- `cleanclaw/core/frontier-reviewer-policy.ts`
- `cleanclaw/core/frontier-reviewer-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-high-risk-reviewer-prompt.md`

## Summary

- Added `createReviewerGatePrompt()` for reviewer gate decisions.
- Added numbered prompt options for asking the reviewer, revising the plan, or stopping.
- Covered prompt creation for high-risk work and null prompt behavior for low-risk in-scope edits.
- Marked the high-risk reviewer prompt test item complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/frontier-reviewer-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
