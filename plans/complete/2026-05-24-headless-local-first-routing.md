# Headless Local-First Routing

Created: 2026-05-24 11:38 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:39 Africa/Johannesburg

## Why

Small headless code tasks should be able to use a local coder model first, while larger or riskier tasks should escalate to a frontier coder/reviewer path.

## Assumptions

- A small task can be approximated by planned file count and risk level.
- Local-first routing chooses the coder role only; reviewer policy remains separate.
- This slice adds the decision helper before runtime integration.

## Checklist

- [x] Add headless task size/risk input model.
- [x] Route small low-risk tasks to local coder first.
- [x] Route larger or riskier tasks to frontier coder.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless local-first routing tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-model-routing.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
