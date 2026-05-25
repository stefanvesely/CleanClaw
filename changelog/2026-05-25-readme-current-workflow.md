# README Current Workflow

Timestamp: 2026-05-25 21:54

## Why

The README had stale planned-work claims for features that are now implemented, which made the project harder to use and evaluate.

## Changed Files

- `README.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-readme-current-workflow.md`

## Summary

- Refreshed the current implementation status at the top of the README.
- Removed stale "still planned" claims for attach, numbered menus, stack inference, ProjectMap freshness, local model routing, NemoClaw startup checks, and guarded headless execution.
- Updated the "How it works" and usage sections to show `cleanclaw` as the interactive project session and `cleanclaw run` as the direct-task path.
- Updated config reference notes for provider, stack, and project-root behavior.
- Marked the README acceptance item complete.

## Validation

- Passed: `npm.cmd run build:cleanclaw`
- Passed: `node bin/cleanclaw.js --help`
- Passed: stale README search returned no matches for completed items still described as planned.
