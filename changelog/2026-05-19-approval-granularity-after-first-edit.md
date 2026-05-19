# Approval Granularity After First Edit

Timestamp: 2026-05-19 17:25 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/control-contract.ts`
- `cleanclaw/core/control-contract.test.ts`
- `cleanclaw/core/project-settings.ts`
- `cleanclaw/core/project-settings.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-approval-granularity-after-first-edit.md`

## Summary

- Added `approvalModeFromProjectSettings`.
- Updated first-edit approval so it can apply the saved project approval mode only after first-edit approval.
- Kept granular `per-change` behavior as the fallback.
- Added focused tests for both settings and task-state behavior.

## Reason

CleanClaw must always start with granular first-edit approval, then respect the project's explicit approval-granularity setting for later changes.

## Validation

- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
