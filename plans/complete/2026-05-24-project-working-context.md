# Project Working Context

Created: 2026-05-24 11:20 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:19 Africa/Johannesburg

## Why

Once CleanClaw is attached to a project, users should be able to work naturally from the project root or nested project folders without re-explaining where the project is.

## Assumptions

- Existing active-project resolution already finds project settings upward from nested folders.
- This slice should expose a reusable context summary for future CLI/session use.
- The helper should not widen scope or change files.

## Checklist

- [x] Add project working context helper.
- [x] Detect whether current cwd is inside the resolved project.
- [x] Format visible working context output.
- [x] Add tests for root, nested, and outside contexts.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused project working context tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-working-context.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
