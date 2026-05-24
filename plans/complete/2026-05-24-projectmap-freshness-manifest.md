# ProjectMap Freshness Manifest

Created: 2026-05-24 19:05 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 19:12 Africa/Johannesburg

## Why

CleanClaw needs to know whether existing project memory is current before it plans or asks for a rebuild. A freshness manifest lets it reuse ProjectMap confidently, spot stale files, and explain exactly why the project memory needs updating.

## Assumptions

- This slice adds the reusable manifest/freshness foundation first.
- Interactive build/rebuild choices can be wired in a follow-up slice.
- The manifest should ignore generated/project-memory folders such as `.cleanclaw`, `node_modules`, `dist`, and `build`.

## Checklist

- [x] Add a ProjectMap manifest helper.
- [x] Track source file paths, sizes, and modified times.
- [x] Detect fresh, changed, added, and deleted files.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused ProjectMap manifest tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/projectmap/manifest.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
