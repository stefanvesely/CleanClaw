# Broader Read-Only Questions

Timestamp: 2026-05-20 20:27 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/project-question.ts`
- `cleanclaw/core/project-question.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-broader-readonly-questions.md`

## Summary

- Expanded read-only question classification beyond project questions.
- Added workflow, planning, approval, validation, scope, and guardrail question terms.
- Added focused tests for workflow and planning questions.

## Reason

CleanClaw should answer project-related questions without creating execution state or requiring a plan.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-question.test.ts cleanclaw/core/request-routing.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
