# Root-Aware State And Logs

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/project-paths.ts`
- `cleanclaw/core/project-paths.test.ts`
- `cleanclaw/core/pipeline.ts`
- `cleanclaw/cli/undo.ts`
- `README.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-18-root-aware-state-logs.md`
- `changelog/2026-05-18-root-aware-state-logs.md`

## Summary

- Added `resolveProjectSubpath()` for resolving project-relative plan/log paths from the active project root.
- Updated pipeline plan/log directory resolution to use the active project root.
- Updated pipeline resumable state loading to read from the active project root.
- Updated rollback/undo config, log lookup, and file restore checks to use the active project root.
- Updated README and the active plan to reflect completed root-aware config/state/log loading.

## Reason

CleanClaw must not let the caller's shell directory change where state, logs, or rollback records are read and written.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-paths.test.ts cleanclaw/cli/show-status.test.ts`
- `npm.cmd run build:cleanclaw`
- `rg -n "path\\.resolve\\(routedConfig\\.plansDir\\)|loadState\\(process\\.cwd\\(\\)|const projectRoot = process\\.cwd\\(\\)" cleanclaw`
- `node bin/cleanclaw.js status`

