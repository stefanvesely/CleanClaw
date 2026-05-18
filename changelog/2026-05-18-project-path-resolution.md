# Project Path Resolution

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/project-paths.ts`
- `cleanclaw/core/project-paths.test.ts`
- `cleanclaw/cli/attach-project.ts`
- `cleanclaw/cli/attach-project.test.ts`
- `README.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-18-project-path-resolution.md`
- `changelog/2026-05-18-project-path-resolution.md`

## Summary

- Added reusable project path resolution for absolute paths, relative paths, `.`, and `~`.
- Added selected-directory validation for existence, directory type, and writability.
- Routed `cleanclaw attach <path>` through the shared resolver/validator.
- Expanded attach tests for relative path resolution, file-path rejection, and writable-probe rejection.
- Updated README and the active plan to reflect the completed Phase 1 slice.

## Reason

CleanClaw needs a reliable and user-visible project root before planning, scanning, or execution can happen safely.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-paths.test.ts cleanclaw/cli/attach-project.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js attach .`

