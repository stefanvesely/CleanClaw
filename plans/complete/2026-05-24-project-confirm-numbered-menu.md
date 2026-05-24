# Project Confirm Numbered Menu

Created: 2026-05-24 18:36 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 18:35 Africa/Johannesburg

## Why

Confirming the project folder is a major decision point. CleanClaw should offer clear numbered choices for using the detected/project directory or choosing another one.

## Assumptions

- Existing yes/no inputs should remain compatible where possible.
- Rejected project selection should still ask for a directory.
- This slice does not add folder discovery yet; it only improves confirmation prompts.

## Checklist

- [x] Replace detected project confirmation prompt with numbered prompt helper.
- [x] Replace explicit project directory confirmation prompt with numbered prompt helper.
- [x] Preserve yes/no compatibility and fallback behavior.
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
