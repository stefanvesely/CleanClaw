# Headless Model Roles

Created: 2026-05-24 11:34 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:34 Africa/Johannesburg

## Why

Headless execution needs separate coder and reviewer/planner responsibilities so one model does the work and another checks the work against the approved why and guardrails.

## Assumptions

- This slice validates role presence and naming.
- Same-model warnings are a later checklist item.
- The reviewer/planner role may be called `reviewer` or `reviewer-planner`.

## Checklist

- [x] Add headless model role validator.
- [x] Require coder role.
- [x] Require reviewer/planner role.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless model role tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-model-roles.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
