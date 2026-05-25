# Headless Storage Policy Guard

Created: 2026-05-25 01:25 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 01:30 Africa/Johannesburg

## Why

Headless execution must not silently change whether ProjectMap is committed, ignored, compacted, or excluded. Storage policy changes are user-control decisions and should be allowed headlessly only when the approved headless plan explicitly includes that policy.

## Assumptions

- Non-headless flows can continue to use the existing interactive storage prompt.
- Headless storage policy approval can be checked against the prepared plan storage policy lines.
- This is a guard helper first; command wiring can call it from headless execution paths.

## Checklist

- [x] Add headless ProjectMap storage policy guard.
- [x] Allow non-headless policy choices.
- [x] Allow headless only when the approved storage policy includes the requested choice.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless storage policy tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-storage-policy.test.ts cleanclaw/core/headless-plan-preparation.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
