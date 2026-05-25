# Frontier Approval Record

Created: 2026-05-25 01:10 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 01:14 Africa/Johannesburg

## Why

Frontier model use is allowed only when the user approves it for a specific purpose. CleanClaw needs a reusable record path so approved frontier use is visible in task state, model routing notes, and approval records.

## Assumptions

- This slice records approval; it does not call a frontier model.
- Purpose-scoped approval should update `modelPolicy.frontierApprovedFor`.
- Model routing records should stay project-local under `.cleanclaw/tasks/<task-id>/`.

## Checklist

- [x] Add frontier approval record helper.
- [x] Update task model policy for the approved purpose.
- [x] Write `model-routing.md`.
- [x] Append an approval record.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused frontier approval record tests.
- Run focused control-contract tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/frontier-approval-record.test.ts cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
