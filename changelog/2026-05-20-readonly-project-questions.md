# Read-Only Project Questions

Timestamp: 2026-05-20 20:15 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/project-question.ts`
- `cleanclaw/core/project-question.test.ts`
- `cleanclaw/cli/interactive-session.ts`
- `cleanclaw/cli/interactive-session.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-readonly-project-questions.md`

## Summary

- Added read-only project question classification.
- Added interactive session mode `read-only-question`.
- Prevented task record and draft plan creation for read-only project questions.
- Added focused tests for classification and session behavior.

## Reason

Users should be able to ask project questions before an execution plan exists without triggering task records, plans, or file changes.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-question.test.ts cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
