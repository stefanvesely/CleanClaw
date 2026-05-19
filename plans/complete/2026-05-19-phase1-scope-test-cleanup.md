# Phase 1 Scope And Test Cleanup

Created: 2026-05-19T00:00:00+02:00
Status: Complete
Completed: 2026-05-19T00:00:00+02:00

## Goal

Finish the remaining Phase 1 scope-rule cleanup and test cleanup items.

## Why

Phase 1 is the control foundation. Before starting the larger interactive planning loop, CleanClaw should have clear rules for planning reads, edit scope, new-file approval, out-of-root requests, marker recording, and visible scope rendering.

## Assumptions

- Most scope behavior is already implemented; this slice should close gaps and add focused proof.
- Out-of-root expansion approval should remain explicit and recorded; unsupported execution paths should fail closed.
- This slice will not start Phase 2 interactive session work.

## Checklist

- [x] Inspect existing marker, scope tree, and scope guard tests.
- [x] Implement or document missing scope-rule behavior in code.
- [x] Add focused tests for marker recording and visible scope rendering.
- [x] Update active plan progress.
- [x] Add changelog.
- [x] Validate focused tests and build.
- [x] Move plan to complete and commit.

## Validation Plan

- focused tests based on changed modules
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

## Validation Results

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts cleanclaw/cli/attach-project.test.ts cleanclaw/core/project-settings.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js status` passed.

## Notes

- Detected project markers are now persisted in `.cleanclaw/settings.json`.
- Scope rule helpers now explicitly represent planning reads, planned edits, planned new files, and out-of-root approval requirements.
- Workspace scope review formatting is now testable and renders scope before the generated plan.
