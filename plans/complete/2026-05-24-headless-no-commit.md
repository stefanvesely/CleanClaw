# Headless No Commit Policy

Created: 2026-05-24 11:48 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:55 Africa/Johannesburg

## Why

Commits must remain explicit user actions outside headless execution so the user stays in control of repository history.

## Assumptions

- Headless can draft a commit message later, but it must not create the commit.
- Interactive/non-headless commit approval remains governed elsewhere.
- This slice adds a hard headless guard.

## Checklist

- [x] Add headless commit guard.
- [x] Reject commit attempts in headless mode.
- [x] Allow non-headless flow to continue to existing commit approval guards.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless git policy tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-git-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
