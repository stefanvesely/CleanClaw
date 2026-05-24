# Setup Stack Selection

Created: 2026-05-24 18:46 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 18:49 Africa/Johannesburg

## Why

During project setup, users should approve or override CleanClaw's inferred stack with numbered choices instead of typing internal stack ids from memory.

## Assumptions

- Setup can infer from markers in the current project directory.
- If no stack can be inferred, setup can fall back to the existing typed prompt.
- The selected stack should be stored in both `cleanclaw.config.json` and `.cleanclaw/settings.json`.

## Checklist

- [x] Infer stack during project setup.
- [x] Show evidence and numbered stack choices.
- [x] Allow override with typed stack id.
- [x] Store selected stack in project settings.
- [x] Update the master plan.
- [x] Run build and CLI help validation.
- [x] Add changelog.

## Validation Plan

- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
