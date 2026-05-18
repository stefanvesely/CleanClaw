# Root Scope Enforcement

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/root-guard.ts`
- `cleanclaw/core/root-guard.test.ts`
- `cleanclaw/core/pipeline.ts`
- `README.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-18-root-scope-enforcement.md`
- `changelog/2026-05-18-root-scope-enforcement.md`

## Summary

- Added active-root-relative file resolution to the root guard.
- Updated pipeline filename validation so relative proposed files resolve against the active project root before filesystem checks and writes.
- Added per-file execution root-guard enforcement before grouped changes are applied.
- Expanded root guard tests for relative in-root and escaping paths.
- Updated README and the active plan to reflect completed root/scope enforcement items.

## Reason

CleanClaw must treat the active project root as the working boundary even when the command is launched from another shell directory.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/root-guard.test.ts cleanclaw/core/scope-tree.test.ts cleanclaw/core/project-paths.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

