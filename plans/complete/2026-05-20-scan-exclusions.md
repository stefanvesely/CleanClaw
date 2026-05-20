# Scan Exclusions

Created: 2026-05-20 20:20 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:19 Africa/Johannesburg

## Why

Broad project scans must ask first and ask what should be excluded so users can keep irrelevant or sensitive areas out of scan scope.

## Assumptions

- Existing broad scan approval records should be extended, not replaced.
- Exclusions are recorded even when the scan is denied or headless-denied.
- Applying exclusions to the scanner can follow after the approval record captures them.

## Checklist

- [x] Add exclusions to scan approval records.
- [x] Ask what should be excluded after scan approval prompt.
- [x] Log exclusions visibly.
- [x] Update focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused folder-scan approval tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/folder-scan-approval.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
