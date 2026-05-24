# ProjectMap Freshness Prompts

Created: 2026-05-24 19:18 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 19:25 Africa/Johannesburg

## Why

CleanClaw should not rebuild project memory blindly. If the ProjectMap is fresh it should say so and reuse it; if it is missing or stale it should show the user exactly what changed and ask before spending time on a build or rebuild.

## Assumptions

- This slice wires setup-time ProjectMap build/rebuild prompts.
- Incremental changed-file updates remain a follow-up slice.
- Numbered choices should be used instead of free-form y/n prompts for ProjectMap build decisions.

## Checklist

- [x] Add ProjectMap freshness summary/action helpers.
- [x] Reuse fresh ProjectMap during setup.
- [x] Ask before building a missing ProjectMap.
- [x] Ask before rebuilding a stale ProjectMap.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused ProjectMap freshness prompt tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/projectmap/freshness-decision.test.ts cleanclaw/projectmap/manifest.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
