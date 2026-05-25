# High-Risk Reviewer Prompt

Created: 2026-05-25 17:19
Status: Complete
Completed: 2026-05-25 17:19

## Why

When CleanClaw detects high-risk work, it must not silently continue. The user needs a numbered choice to ask the reviewer, revise the plan, or stop.

## Assumptions

- The prompt can be generated from the reviewer gate decision.
- Review still needs approval/configuration through the reviewer policy.
- This slice covers prompt creation, not full CLI wiring.

## Checklist

- [x] Add a numbered reviewer gate prompt.
- [x] Make high-risk work recommend asking the reviewer.
- [x] Add focused tests for prompt options and null prompt behavior.
- [x] Mark the master plan high-risk reviewer prompt item complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/frontier-reviewer-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/frontier-reviewer-policy.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
