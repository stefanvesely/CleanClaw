# Local Frontier Escalation Policy

Created: 2026-05-25 01:48 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 01:51 Africa/Johannesburg

## Why

CleanClaw should start local, but it needs a clear moment where it stops and asks before escalating to a frontier reviewer. Timeouts, low confidence, high complexity, and high risk should become visible user choices, not automatic calls.

## Assumptions

- This slice adds the decision and prompt model.
- The actual model call still remains behind existing frontier approval controls.
- The prompt should explain why escalation is recommended.

## Checklist

- [x] Detect timeout, low-confidence, complexity, and high-risk escalation reasons.
- [x] Produce a frontier reviewer prompt only when escalation is recommended.
- [x] Keep local-only allowed when no escalation signal exists.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused escalation policy tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/frontier-escalation-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
