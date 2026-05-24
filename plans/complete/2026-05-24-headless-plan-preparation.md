# Headless Plan Preparation

Created: 2026-05-24 11:03 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:05 Africa/Johannesburg

## Why

CleanClaw needs to let users prepare multiple approved plans for future headless execution while still preventing headless execution from starting without explicit, complete guardrails.

## Assumptions

- Preparing a plan for headless execution is not the same as running it.
- Only plans with `Status: approved` can be prepared.
- A prepared plan should become `Status: ready-for-execution`.
- The first slice can enforce required metadata in code before wiring the interactive menu.

## Checklist

- [x] Add a headless plan preparation contract.
- [x] Require approved why, scope tree, risk limits, validation policy, storage policy, model policy, stop conditions, and coder/reviewer roles.
- [x] Mark valid approved plans as `ready-for-execution`.
- [x] Add tests for complete and incomplete preparation records.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless plan preparation tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-plan-preparation.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
