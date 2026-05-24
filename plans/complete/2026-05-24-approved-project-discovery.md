# Approved Project Discovery

Created: 2026-05-24 11:16 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 11:17 Africa/Johannesburg

## Why

CleanClaw can help users find the right project when they start in the wrong folder, but folder scanning must happen only after explicit user approval.

## Assumptions

- This slice adds a core discovery gate, not the full interactive prompt.
- Discovery should be shallow and marker-based.
- Missing approval should fail closed.

## Checklist

- [x] Add approval-required project discovery helper.
- [x] Scan candidate folders for project markers only after approval.
- [x] Return visible evidence for discovered project candidates.
- [x] Add tests for denied and approved discovery.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused project discovery tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-discovery.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
