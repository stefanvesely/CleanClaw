# Headless Storage Policy Guard

Timestamp: 2026-05-25 01:30 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-storage-policy.ts`
- `cleanclaw/core/headless-storage-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-headless-storage-policy-guard.md`

## Summary

- Added a guard for ProjectMap storage-policy choices in headless execution.
- Interactive flows remain allowed to ask the user.
- Headless flows can choose a ProjectMap storage policy only when the approved headless plan includes the requested policy.

## Why

ProjectMap storage decisions affect what enters the repo and must stay under explicit user control, especially when execution is headless.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-storage-policy.test.ts cleanclaw/core/headless-plan-preparation.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
