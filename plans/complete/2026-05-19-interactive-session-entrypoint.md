# Interactive Session Entrypoint

Created: 2026-05-19T00:00:00+02:00
Status: Complete
Completed: 2026-05-19T00:00:00+02:00

## Goal

Add the first no-arg `cleanclaw` interactive session entrypoint.

## Why

CleanClaw needs to start like a coding-agent terminal: ask what work the user wants to do, stay status-aware, and begin project/task scoping before execution.

## Assumptions

- This slice creates the entrypoint and first task intake only.
- Project inference and in-progress plan selection can be built in the next slices.
- No file changes should be made by the interactive session in this slice.

## Checklist

- [x] Inspect current CLI command behavior.
- [x] Add interactive session module.
- [x] Wire no-arg `cleanclaw` to the session.
- [x] Add focused tests.
- [x] Update active plan and changelog.
- [x] Validate focused tests/build.
- [x] Move plan to complete and commit.

## Validation Plan

- focused tests based on changed modules
- `npm.cmd run build:cleanclaw`
- CLI smoke for `node bin/cleanclaw.js --help` and no-arg behavior where feasible

## Validation Results

- `npx.cmd vitest run cleanclaw/cli/interactive-session.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js --help` passed.
- No-arg behavior was covered by dependency-injected focused tests rather than a shell smoke because the real command is interactive.
