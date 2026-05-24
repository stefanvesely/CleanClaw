# Numbered Prompt Helper

Created: 2026-05-24 12:13 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 18:27 Africa/Johannesburg

## Why

CleanClaw needs reusable numbered menus so non-engineers can make clear choices without typing internal ids, while still allowing natural language and exit controls.

## Assumptions

- This slice adds the reusable core helper before wiring every CLI prompt.
- The helper should be plain text and work cleanly in PowerShell, cmd, and POSIX shells.
- Natural language should be returned for the caller to route safely.

## Checklist

- [x] Add reusable numbered prompt helper.
- [x] Support number selection.
- [x] Support Enter default.
- [x] Support typed id fallback.
- [x] Support back, cancel, and exit controls.
- [x] Support natural language fallback.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused numbered prompt tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/numbered-prompt.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
