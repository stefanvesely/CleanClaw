# Approved Project Discovery

Timestamp: 2026-05-24 11:17 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/project-discovery.ts`
- `cleanclaw/core/project-discovery.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-approved-project-discovery.md`

## Summary

- Added approval-gated project discovery for helping users find candidate project folders.
- Kept discovery shallow and marker-based.
- Added numbered candidate formatting with visible evidence.
- Added tests for denied discovery, approved discovery, and formatted output.

## Reason

CleanClaw should help users recover when launched from the wrong folder without scanning folders silently.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-discovery.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
