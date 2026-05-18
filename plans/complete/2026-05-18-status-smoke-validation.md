# Status Smoke Validation

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Smoke-test the current `cleanclaw status` path after adding project-local settings, active project resolution, task records, and root-aware config loading.

## Assumptions

- Use the built CLI from `dist/`.
- Avoid interactive `cleanclaw init` in this slice.
- If the README output does not match the smoke result, update the docs.

## Checklist

- [x] Build CleanClaw.
- [x] Run `node bin/cleanclaw.js status` in the real repo.
- [x] Inspect whether README/status docs need updating.
- [x] Update records/changelog.
- [x] Commit if files change.

## Validation Plan

- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

## Validation Results

- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js status` passed and reported:
  - active project `test`
  - directory `D:\Projects\CC\CleanClaw`
  - resolver source `project-config`
  - legacy settings/task-record gaps as `missing` / `none`

## Notes

- README status drift was found and corrected so completed scope tree, project-local settings, resolver, and status work no longer appears in the "Still planned" list.
