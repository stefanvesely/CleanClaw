# Interactive Session Loop

Created: 2026-05-24 11:22 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:23 Africa/Johannesburg

## Why

During an active CleanClaw session, the user should not need to repeatedly type `cleanclaw` after each task or project question.

## Assumptions

- The existing `startInteractiveSession()` remains a single-turn primitive.
- The no-arg CLI should use a loop primitive.
- The loop must exit cleanly when the user asks to stop or provides no task.

## Checklist

- [x] Add interactive loop function.
- [x] Prompt for next work after each completed turn.
- [x] Stop cleanly on exit/no.
- [x] Wire no-arg CLI to the loop.
- [x] Add focused loop tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused interactive session tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
