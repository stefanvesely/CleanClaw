# Scan Exclusions

Timestamp: 2026-05-20 20:19 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/folder-scan-approval.ts`
- `cleanclaw/core/folder-scan-approval.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-scan-exclusions.md`

## Summary

- Added exclusions to broad folder scan approval records.
- Added an exclusion prompt after scan approval.
- Added visible logging for scan exclusions.
- Added parsing and tests for comma-separated exclusions.

## Reason

Broad project scanning must preserve user control by asking what should not be scanned before looking broadly through the project.

## Validation

- `npx.cmd vitest run cleanclaw/core/folder-scan-approval.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
