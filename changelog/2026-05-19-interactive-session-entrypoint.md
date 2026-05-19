# Interactive Session Entrypoint

Timestamp: 2026-05-19T00:00:00+02:00

## Changed Files

- `bin/cleanclaw.js`
- `cleanclaw/cli/interactive-session.ts`
- `cleanclaw/cli/interactive-session.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-interactive-session-entrypoint.md`
- `changelog/2026-05-19-interactive-session-entrypoint.md`

## Summary

- Added the first no-arg `cleanclaw` interactive session entrypoint.
- The session asks what work the user wants to do before assuming the current folder is correct.
- When a project is detected, the session asks whether to scope the work in that project folder.
- Added focused tests for task-first session intake and no-task behavior.

## Reason

CleanClaw needs to start like a coding-agent terminal before Phase 2 can add project inference, plan selection, and planning mode behavior.

## Validation Performed

- `npx.cmd vitest run cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`

