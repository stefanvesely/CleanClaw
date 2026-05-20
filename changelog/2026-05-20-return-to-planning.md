# Return To Planning

Timestamp: 2026-05-20 20:05 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/completion-planning.ts`
- `cleanclaw/core/completion-planning.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-return-to-planning.md`

## Summary

- Added completion-to-planning summary helper.
- Completion transitions eligible task states to `done`.
- The summary returns `nextMode: planning` and visible prompt text for the next user choice.
- Covered broader-approval expiry on completion.

## Reason

CleanClaw should not continue autonomously after task completion; it should return to planning mode and let the user decide the next step.

## Validation

- `npx.cmd vitest run cleanclaw/core/completion-planning.test.ts cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
