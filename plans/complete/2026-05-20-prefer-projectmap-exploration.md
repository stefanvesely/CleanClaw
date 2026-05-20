# Prefer ProjectMap Exploration

Created: 2026-05-20 20:22 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:22 Africa/Johannesburg

## Why

CleanClaw should prefer ProjectMap for read-only project exploration when available, because it minimizes broad scans and keeps project context local.

## Assumptions

- A ProjectMap with vector tables is considered ready.
- Registry-only or missing ProjectMap should not block work; CleanClaw can fall back to approved scanning or manual context.
- This slice exposes the decision as a reusable helper.

## Checklist

- [x] Add project exploration source helper.
- [x] Prefer ProjectMap when status is ready.
- [x] Fall back to approved scan/manual context otherwise.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused project-exploration tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-exploration.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
