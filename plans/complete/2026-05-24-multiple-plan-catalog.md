# Multiple Plan Catalog

Created: 2026-05-24 11:08 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:07 Africa/Johannesburg

## Why

CleanClaw needs to show users multiple available plans clearly, including more than one plan for the same task and plans for different tasks, so the user can stay in control of what gets continued or executed.

## Assumptions

- Existing plan files already include `Task ID:` when created by the session planner.
- Plans without a task id should still appear under an `unassigned` group.
- This slice can add grouping/formatting helpers before wiring the interactive menu.

## Checklist

- [x] Add task id extraction to plan summaries.
- [x] Add grouped plan catalog helpers.
- [x] Format grouped choices with numbering and task grouping.
- [x] Add tests for same-task and different-task plans.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused plan discovery tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/plan-discovery.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
