# Reviewer Gate Policy

Timestamp: 2026-05-25 17:18

## Why

CleanClaw needs explicit reviewer checkpoints before execution, risky or scope-changing edits, and headless completion so the user stays in control.

## Changed Files

- `cleanclaw/core/frontier-reviewer-policy.ts`
- `cleanclaw/core/frontier-reviewer-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-reviewer-gate-policy.md`

## Summary

- Added reviewer gate stages for `before-execution`, `before-edit`, and `headless-completion`.
- Added reviewer gate decisions with purpose strings and plain-language reasons.
- Covered before-execution, high-risk/scope-changing edit, headless completion, and low-risk in-scope edit cases.
- Marked the reviewer-gate master-plan item complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/frontier-reviewer-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
