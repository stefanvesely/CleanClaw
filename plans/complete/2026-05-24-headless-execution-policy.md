# Headless Execution Policy

Created: 2026-05-24 11:27 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:28 Africa/Johannesburg

## Why

Headless execution must remain an explicit user choice and must have separate coder/reviewer roles before CleanClaw can run without the user in the loop.

## Assumptions

- Headless execution requires a plan already marked `ready-for-execution`.
- Opt-in must include explicit user text.
- Coder and reviewer roles must both be named.

## Checklist

- [x] Add headless execution policy check.
- [x] Require ready plan status.
- [x] Require explicit opt-in user text.
- [x] Require coder and reviewer roles.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless execution policy tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-execution-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
