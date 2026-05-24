# Headless Coder Task Package

Created: 2026-05-24 11:36 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:36 Africa/Johannesburg

## Why

The headless coder must receive only one approved task at a time so it cannot drift into the wider plan or infer scope that belongs to another step.

## Assumptions

- Granular headless steps are already modeled.
- The task package should contain only the selected step details.
- The full plan can remain available to the reviewer/planner, not the coder.

## Checklist

- [x] Add coder task package model.
- [x] Build a package from one granular step.
- [x] Exclude sibling steps from coder package.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless coder task package tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-coder-task.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
