# Plan Choice Numbered Menu

Created: 2026-05-24 18:34 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 18:32 Africa/Johannesburg

## Why

When CleanClaw finds existing plans, the user should choose whether to continue or start new with a numbered menu instead of typing command words.

## Assumptions

- This is a clear decision point and should use the shared numbered prompt helper.
- Existing natural-language fallback should still route safely.
- Selecting continue still chooses the first plan for now; selecting a specific plan is a later enhancement.

## Checklist

- [x] Replace continue/new text prompt with numbered prompt helper.
- [x] Preserve continue and new behavior.
- [x] Allow natural-language fallback.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused interactive session tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
