# Low Token And Full Fix Plan Variants

Created: 2026-05-24 11:10 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:09 Africa/Johannesburg

## Why

CleanClaw needs to present low-token fixes and full fixes as explicit user choices with clear tradeoffs, because the user should decide the level of work before execution.

## Assumptions

- The first implementation can define the variant model and formatter without changing the full interactive loop.
- Low-token and full-fix are the required baseline variants.
- Future comparison/recommendation work can consume this model.

## Checklist

- [x] Add plan variant types for low-token and full-fix.
- [x] Add default variant descriptions and tradeoffs.
- [x] Add numbered variant choice formatting.
- [x] Add tests for default variants and formatting.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused plan variant tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/plan-variants.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
