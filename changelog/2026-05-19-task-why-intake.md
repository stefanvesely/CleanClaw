# Task Why Intake

Timestamp: 2026-05-19 17:03 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/task-why.ts`
- `cleanclaw/core/task-why.test.ts`
- `cleanclaw/cli/interactive-session.ts`
- `cleanclaw/cli/interactive-session.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-task-why-intake.md`

## Summary

- Added a task-why helper to draft, normalize, and create an approved why.
- Added a why confirmation step after project confirmation and before in-progress plan discovery.
- Updated interactive-session results to carry the approved why forward.
- Covered default proposed-why acceptance and user replacement flows in focused tests.

## Reason

CleanClaw needs a user-approved why before scope and execution decisions so later choices can be checked against the purpose of the task.

## Validation

- `npx.cmd vitest run cleanclaw/core/task-why.test.ts cleanclaw/core/project-intake.test.ts cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
