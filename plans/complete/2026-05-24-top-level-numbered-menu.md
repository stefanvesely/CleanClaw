# Top-Level Numbered Menu

Created: 2026-05-24 18:32 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 18:30 Africa/Johannesburg

## Why

CleanClaw should use numbered options at clear decision points, starting with the session loop's top-level next-action prompt, without making every user input mechanical.

## Assumptions

- The task prompt remains natural language.
- The top-level next-action prompt can use the numbered helper.
- Natural language at the top level should continue as a new task request.

## Checklist

- [x] Wire the numbered prompt helper into the session loop next-action prompt.
- [x] Keep natural-language task input supported.
- [x] Handle exit/cancel controls.
- [x] Add focused interactive-session tests.
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
