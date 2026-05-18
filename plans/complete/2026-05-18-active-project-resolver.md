# Active Project Resolver

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Make CleanClaw prefer the current project folder and project-local settings before falling back to the global active-project pointer.

## Assumptions

- Keep the global active-project pointer as fallback.
- Prefer the nearest/current directory when it contains `cleanclaw.config.json` or `.cleanclaw/settings.json`.
- Do not rewrite config loading in this slice.

## Checklist

- [x] Add active project resolver helper.
- [x] Add tests for local settings, config marker, and global fallback.
- [x] Wire status, run workflow, and pipeline root lookups to the resolver.
- [x] Update plan/changelog.
- [x] Run validation and commit.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/project-resolver.test.ts`
- `npm.cmd run build:cleanclaw`

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-resolver.test.ts cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`
