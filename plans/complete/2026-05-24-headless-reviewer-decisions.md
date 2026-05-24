# Headless Reviewer Decisions

Created: 2026-05-24 11:41 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:41 Africa/Johannesburg

## Why

The headless reviewer/planner may need to make bounded decisions, but those decisions must stay inside the approved why and allowed options.

## Assumptions

- The reviewer can choose only from pre-approved decisions.
- Why alignment is represented as aligned, unclear, or misaligned.
- Unclear or misaligned decisions must block instead of proceeding.

## Checklist

- [x] Add bounded reviewer decision model.
- [x] Allow decisions only when aligned with the why.
- [x] Block decisions outside allowed options.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless reviewer decision tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-reviewer-decision.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
