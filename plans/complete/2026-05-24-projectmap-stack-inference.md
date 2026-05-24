# ProjectMap Stack Inference

Created: 2026-05-24 20:05 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 20:08 Africa/Johannesburg

## Why

CleanClaw should infer stack from both current project markers and ProjectMap memory. If ProjectMap already knows the project file list, stack inference can use that evidence and explain why it selected a stack.

## Assumptions

- ProjectMap manifest file paths are enough for this first integration.
- Live marker detection should still run and be merged with ProjectMap-derived markers.
- Duplicate marker evidence should be de-duplicated before scoring.

## Checklist

- [x] Add marker detection from known relative paths.
- [x] Merge ProjectMap manifest markers into setup stack inference.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused marker and stack inference tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-markers.test.ts cleanclaw/core/stack-inference.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
