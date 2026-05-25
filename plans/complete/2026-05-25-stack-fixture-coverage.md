# Stack Fixture Coverage

Created: 2026-05-25 17:20 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 17:25 Africa/Johannesburg

## Why

The plan calls for fixture coverage across supported stacks. CleanClaw already infers some stacks, but the marker list and tests need to cover the broader set so setup can say why it thinks a project is Next, Vue, FastAPI, Laravel, Rails, Flutter, React Native, and similar stacks.

## Assumptions

- Deterministic file/config markers are enough for fixture coverage.
- Dependency parsing can come later; this slice focuses on recognizable project files.
- Override persistence already exists but should be reflected in the master plan once tests are confirmed.

## Checklist

- [x] Expand project marker kinds and known files.
- [x] Expand stack inference framework labels.
- [x] Add fixture coverage for supported stack signals.
- [x] Confirm mixed-stack, unknown fallback, and override persistence tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused project marker, stack inference, and stack selection tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-markers.test.ts cleanclaw/core/stack-inference.test.ts cleanclaw/core/stack-selection.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
