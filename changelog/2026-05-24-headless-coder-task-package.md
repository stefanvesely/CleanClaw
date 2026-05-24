# Headless Coder Task Package

Timestamp: 2026-05-24 11:36 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-coder-task.ts`
- `cleanclaw/core/headless-coder-task.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-headless-coder-task-package.md`

## Summary

- Added a headless coder task package model.
- Built packages from one selected granular step.
- Excluded sibling step context from coder-facing packages.
- Added tests for selected-step packaging, missing step rejection, and formatted output.

## Reason

Headless coder models should receive bounded work only, not the full plan scope.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-coder-task.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
