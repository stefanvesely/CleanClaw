# ProjectMap Stack Inference

Timestamp: 2026-05-24 20:08 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/project-markers.ts`
- `cleanclaw/core/project-markers.test.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-projectmap-stack-inference.md`

## Summary

- Added marker detection from known ProjectMap-style relative file paths.
- Setup stack inference now merges live project markers with markers derived from the ProjectMap manifest file list.
- Duplicate stack evidence is de-duplicated before stack scoring.

## Why

CleanClaw should use durable project memory as stack evidence while still preserving live filesystem checks and user confirmation.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-markers.test.ts cleanclaw/core/stack-inference.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
