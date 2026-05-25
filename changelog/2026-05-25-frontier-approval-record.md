# Frontier Approval Record

Timestamp: 2026-05-25 01:14 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/frontier-approval-record.ts`
- `cleanclaw/core/frontier-approval-record.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-frontier-approval-record.md`

## Summary

- Added a reusable frontier approval recording helper.
- Approved frontier use updates `modelPolicy.frontierApprovedFor` for the exact purpose.
- The helper writes `model-routing.md` and appends an approval record under the task folder.

## Why

Frontier model use must be explicit, purpose-scoped, and auditable before CleanClaw can safely route model work beyond local-first behavior.

## Validation

- `npx.cmd vitest run cleanclaw/core/frontier-approval-record.test.ts cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
