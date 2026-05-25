# README Current Workflow

Created: 2026-05-25 21:52
Status: Complete
Completed: 2026-05-25 21:54

## Why

The README should match the real CleanClaw workflow so the project is usable and does not send users toward already-completed or stale plan items.

## Assumptions

- Keep the test-project warning at the top.
- Document current implemented capabilities and remaining release gates honestly.
- Avoid claiming full production readiness until smoke tests are closed.

## Checklist

- [x] Refresh top README status.
- [x] Remove stale "still planned" items that are implemented.
- [x] Document current command/workflow shape.
- [x] Mark README acceptance item complete.
- [x] Add changelog entry.
- [x] Run documentation-safe validation.

## Validation Performed

- Passed: `npm.cmd run build:cleanclaw`
- Passed: `node bin/cleanclaw.js --help`
- Passed: stale README search returned no matches for completed items still described as planned.

## Validation Plan

- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.
