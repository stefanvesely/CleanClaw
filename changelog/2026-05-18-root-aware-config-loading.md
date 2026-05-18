# Root Aware Config Loading

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/config-loader.ts`
- `cleanclaw/core/config-loader.test.ts`
- `cleanclaw/cli/run-workflow.ts`
- `plans/inprogress/2026-05-18-root-aware-config-loading.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`

## Summary

- Refactored config loading to read on demand instead of caching config at module import time.
- Added `getConfigForProject(projectRoot)` for explicit root-aware config loading.
- Kept `getConfig()` as a compatible API that uses the resolved active project root.
- Updated `runWorkflow` to resolve the active project before loading config and legacy state.
- Added tests for loading project config from a provided root and falling back to defaults/global config when missing.

## Reason

- CleanClaw should not accidentally load configuration from the wrong shell directory. Configuration must follow the resolved active project root.

## Validation

- `npx.cmd vitest run cleanclaw/core/config-loader.test.ts cleanclaw/core/project-resolver.test.ts`
- `npm.cmd run build:cleanclaw`
