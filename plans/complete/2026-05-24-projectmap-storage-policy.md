# ProjectMap Storage Policy

Created: 2026-05-24 19:45 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 19:52 Africa/Johannesburg

## Why

ProjectMap should be useful project memory without surprising the user with large committed files. CleanClaw needs to measure `.cleanclaw/projectmap/`, treat 50 MB as a warning threshold, and ask for an explicit storage policy when the project memory is larger than expected.

## Assumptions

- The threshold is a warning, not a hard block.
- This slice can store the selected policy in the manifest.
- Implementing actual `.gitignore` changes for the local-only choice can be a follow-up approval step.

## Checklist

- [x] Add ProjectMap directory size inspection.
- [x] Add storage-policy summaries and numbered choices.
- [x] Store selected policy and last observed size in the manifest.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused ProjectMap storage policy tests.
- Run focused manifest tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/projectmap/storage-policy.test.ts cleanclaw/projectmap/manifest.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
