# Reviewer Gate Policy

Created: 2026-05-25 17:17
Status: Complete
Completed: 2026-05-25 17:18

## Why

CleanClaw needs a visible reviewer checkpoint before execution, risky or scope-changing edits, and headless completion so the user stays in control when model drift or plan drift could matter.

## Assumptions

- This slice should define the reusable decision policy, not wire every command path.
- Reviewer use still respects the existing frontier reviewer approval/configuration policy.
- The gate should explain why review is required in plain language.

## Checklist

- [x] Add reviewer gate stages and decision helper.
- [x] Require review before execution, risky/scope-changing edits, and headless completion.
- [x] Add focused reviewer gate tests.
- [x] Mark the master plan item complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/frontier-reviewer-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/frontier-reviewer-policy.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
