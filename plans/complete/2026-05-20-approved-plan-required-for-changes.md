# Approved Plan Required For Changes

Created: 2026-05-20 20:18 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:17 Africa/Johannesburg

## Why

CleanClaw must prevent all file changes unless they belong to an approved plan, not merely an approved file list.

## Assumptions

- A task needs a concrete approved-plan record before execution edits can pass.
- File scope and first-edit approval remain separate controls.
- The approved-plan record should store user approval text and the plan path.

## Checklist

- [x] Add approved-plan record to task state.
- [x] Add helper to approve a plan.
- [x] Require approved plan before file edits.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused control-contract tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
