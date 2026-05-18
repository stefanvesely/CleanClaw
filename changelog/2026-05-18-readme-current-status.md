# README Current Status Update

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `README.md`
- `plans/inprogress/2026-05-18-readme-current-status.md`

## Summary

- Added a current implementation status section near the top of the README.
- Documented the completed control contract, project-local task records, and visible scope tree foundation.
- Clarified that scope tree rendering, scope-expansion pauses, project-local settings, planning-first loop, numbered menus, stack inference, ProjectMap freshness, local model routing, NemoClaw startup checks, and guarded headless execution are still planned.
- Documented new `.cleanclaw/tasks/<task-id>/` record files.
- Corrected approval granularity wording so `per-change` is the planned default and broader modes require explicit user preference.

## Reason

- The README needed to reflect the actual implementation state after the Phase 0 and visible-scope-tree slices.

## Validation

- `Select-String -Path README.md -Pattern "Current Implementation Status","state.json","scope-tree.json","per-change"`
- `git diff --check`
