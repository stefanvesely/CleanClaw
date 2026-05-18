# Project Attach Command

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Add a first pass of `cleanclaw attach <path>` so CleanClaw can deliberately attach to a project directory, show detected project markers, and save project-local settings/state.

## Why

CleanClaw must stay under user control. Attaching to a project root explicitly gives the user a clear boundary before planning, scanning, execution, or model/runtime setup begins.

## Assumptions

- This slice can be non-interactive: the user provides the path as a command argument.
- Interactive numbered root selection can build on this command in a later slice.
- Marker detection should be reusable by setup/status/planning later.

## Checklist

- [x] Add reusable project marker detection.
- [x] Add `cleanclaw attach <path>` CLI implementation.
- [x] Wire the command into `bin/cleanclaw.js`.
- [x] Add focused tests.
- [x] Update README and active plan progress.
- [x] Add changelog.
- [x] Validate build/tests.
- [x] Move this plan to complete and commit.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/project-markers.test.ts cleanclaw/cli/attach-project.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js attach .`
- `node bin/cleanclaw.js status`

## Validation Results

- `npx.cmd vitest run cleanclaw/core/project-markers.test.ts cleanclaw/cli/attach-project.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js attach .` passed after escalation because the command writes the global active-project pointer under the user profile.
- `node bin/cleanclaw.js status` passed and resolved the project by `project-settings`.
