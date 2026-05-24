# Headless Stop Policy

Created: 2026-05-24 11:46 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:46 Africa/Johannesburg

## Why

Headless execution must stop instead of improvising whenever it cannot continue inside the approved plan, scope, why, model policy, validation policy, or runtime policy.

## Assumptions

- Stop reasons can be represented as policy categories.
- The stop policy should create a blocked report instead of continuing.
- Runtime execution wiring can call this helper later.

## Checklist

- [x] Add stop policy categories.
- [x] Create a blocked report from stop-policy violations.
- [x] Include allowed next actions.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless stop policy tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-stop-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
