# Root Aware Config Loading

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Make CleanClaw load `cleanclaw.config.json` from the resolved project root instead of whichever shell directory imported the config loader.

## Assumptions

- Preserve `getConfig()` as the default API.
- Add `getConfigForProject(projectRoot)` for explicit root-aware loading.
- Keep global config fallback unchanged.

## Checklist

- [x] Refactor config loader to read on demand.
- [x] Add tests for root-aware config loading.
- [x] Wire run workflow to use the resolved project root.
- [x] Update plan/changelog.
- [x] Run validation and commit.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/config-loader.test.ts`
- `npm.cmd run build:cleanclaw`

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/config-loader.test.ts cleanclaw/core/project-resolver.test.ts`
- `npm.cmd run build:cleanclaw`
