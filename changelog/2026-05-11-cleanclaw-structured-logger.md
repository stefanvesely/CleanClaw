# CleanClaw Structured Logger

Timestamp: 2026-05-11

## Changed Files

- `cleanclaw/core/logger.ts`
- `cleanclaw/core/logger.test.ts`
- `cleanclaw/core/pipeline.ts`
- `cleanclaw/core/verification-layer.ts`
- `cleanclaw/core/boss-agent.ts`
- `cleanclaw/core/sandbox-policy.ts`
- `cleanclaw/core/file-scanner.ts`
- `cleanclaw/cli/run-workflow.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `cleanclaw/cli/show-status.ts`
- `cleanclaw/cli/switch-project.ts`
- `cleanclaw/cli/undo.ts`
- `cleanclaw/plans/plan-writer.ts`
- `cleanclaw/projectmap/build.ts`
- `cleanclaw/projectmap/list-projects.ts`
- `cleanclaw/projectmap/query-bridge.ts`
- `cleanclaw/projectmap/updater.ts`
- `cleanclaw/projectmap/updater-worker.ts`
- `plans/incomplete/2026-05-10-cleanclaw-next-work.md`
- `plans/complete/2026-05-11-cleanclaw-structured-logger.md`

## Summary

- Added a reusable `CleanClawLogger` interface with console, silent, and memory implementations.
- Replaced direct CleanClaw `console.*` and `process.stderr` writes with injectable logger calls.
- Threaded the logger through the workflow, pipeline, approval prompts, ProjectMap helpers, file scanner, undo, and plan completion warning paths.
- Added focused logger tests.
- Fixed the setup wizard embedding-model prompt string while updating that file for logger injection.

## Reason

CleanClaw needs to run cleanly both as a standalone CLI and as an embedded NemoClaw/OpenClaw mode. Direct console writes made embedding noisy and hard to test.

## Validation

- Passed: `rg "console\.|process\.stderr" -n cleanclaw` returned no matches.
- Passed: `git diff --check`.
- Passed: `node --check bin/cleanclaw.js`.
- Blocked: focused Vitest/TypeScript validation was not run because `npm`, `tsc`, and local `node_modules/.bin` tools are not available in this environment.
