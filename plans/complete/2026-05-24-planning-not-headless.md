# Planning Cannot Be Headless

Created: 2026-05-24 11:25 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:25 Africa/Johannesburg

## Why

Planning depends on the user as the link to the client, so CleanClaw must not create or approve planning decisions in headless mode.

## Assumptions

- Headless execution can only happen after planning is complete.
- A small guard function is enough for this slice.
- Future CLI wiring can call the guard before any headless planning path.

## Checklist

- [x] Add planning-headless guard.
- [x] Allow non-headless planning.
- [x] Reject headless planning with a clear message.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless planning guard tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-planning-guard.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
