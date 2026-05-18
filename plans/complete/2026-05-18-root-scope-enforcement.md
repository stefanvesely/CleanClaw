# Root Scope Enforcement

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Tighten Phase 1 root/scope enforcement so CleanClaw refuses work outside the active project root unless scope is explicitly expanded.

## Why

CleanClaw's core promise is user control. The attached project root must be a real boundary, and scope changes must be visible before execution widens what the agent can touch.

## Assumptions

- Per-change execution already blocks writes outside the active root.
- This slice should focus on deterministic helpers/tests and wiring any missing obvious call sites.
- Full interactive out-of-root expansion approval remains a later controlled workflow task unless already supported.

## Checklist

- [x] Inspect root guard and scope guard behavior.
- [x] Add focused tests for outside-root blocking and scope expansion behavior.
- [x] Fix any obvious enforcement gaps found during inspection.
- [x] Update README and active plan progress.
- [x] Add changelog.
- [x] Validate focused tests/build/status smoke.
- [x] Move plan to complete and commit.

## Validation Plan

- focused tests based on changed modules
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

## Validation Results

- `npx.cmd vitest run cleanclaw/core/root-guard.test.ts cleanclaw/core/scope-tree.test.ts cleanclaw/core/project-paths.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js status` passed.

## Notes

- Existing scope-tree tests already cover out-of-root scope additions being recorded as unapproved requests.
- This slice fixed relative path handling so proposed files resolve against the active root, not shell cwd.
- Per-file execution now applies the same root guard before applying grouped changes.
