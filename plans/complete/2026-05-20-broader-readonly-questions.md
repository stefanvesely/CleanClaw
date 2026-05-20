# Broader Read-Only Questions

Created: 2026-05-20 20:27 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:27 Africa/Johannesburg

## Why

Users should be able to ask workflow, planning, and project-related questions without creating execution state.

## Assumptions

- This extends read-only question classification.
- Change requests should still route to planning, not read-only mode.
- The session behavior already uses the classifier, so updating it broadens support.

## Checklist

- [x] Expand read-only question terminology.
- [x] Add workflow and planning question tests.
- [x] Keep change requests rejected from read-only mode.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused project-question and request-routing tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-question.test.ts cleanclaw/core/request-routing.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
