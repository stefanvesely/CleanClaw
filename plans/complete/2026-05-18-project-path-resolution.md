# Project Path Resolution

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Add reusable project path resolution and directory validation for `cleanclaw attach`.

## Why

CleanClaw must attach to the exact project directory the user intended. Normalizing absolute paths, relative paths, `.`, and `~` before saving the root keeps project control explicit and avoids accidental work from the wrong shell directory.

## Assumptions

- This slice validates command-line paths only; interactive numbered selection comes later.
- Writable validation should use a temporary probe file inside the selected directory.
- Validation errors should be clear enough for non-engineers to understand.

## Checklist

- [x] Add reusable project path resolver and validation helper.
- [x] Wire `cleanclaw attach <path>` through the helper.
- [x] Add focused tests for `.`, relative paths, absolute paths, `~`, missing paths, file paths, and non-writable paths where feasible.
- [x] Update README and active plan progress.
- [x] Add changelog.
- [x] Validate focused tests and build.
- [x] Move plan to complete and commit.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/project-paths.test.ts cleanclaw/cli/attach-project.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js attach .`

## Validation Results

- `npx.cmd vitest run cleanclaw/core/project-paths.test.ts cleanclaw/cli/attach-project.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js attach .` passed.
