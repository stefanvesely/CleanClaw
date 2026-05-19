# Block Planning Edits

Created: 2026-05-19 17:24 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:19 Africa/Johannesburg

## Why

CleanClaw must not allow file edits while the task is still in planning states, even if files are already known or proposed. Execution must remain a distinct approved state.

## Assumptions

- `assertCanEditFile` is the central software guard for edits.
- Only `execution` and `review_diff` should allow edit checks to pass.
- Existing root, approved-why, and approved-file checks should still apply.

## Checklist

- [x] Add an edit-state guard to the control contract.
- [x] Keep existing approved why, root, and file-scope checks.
- [x] Add focused tests for blocked planning edits and allowed execution edits.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused control-contract tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
