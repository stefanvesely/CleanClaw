# Local Runtime Lifecycle Policy

Created: 2026-05-25 17:24
Status: Complete
Completed: 2026-05-25 17:25

## Why

CleanClaw should only start local LLM runtime when CleanClaw is actually running, should explain setup problems clearly, and should stop session-owned local runtime unless the project explicitly says otherwise.

## Assumptions

- This slice defines lifecycle decisions, not process spawning.
- NemoClaw/OpenShell-backed runtime is preferred when configured.
- Local runtime should not start during install or passive project inspection.

## Checklist

- [x] Add local runtime lifecycle decision helper.
- [x] Block local startup unless CleanClaw is running.
- [x] Provide clear unavailable/setup guidance.
- [x] Default session-owned runtime to stop at session end.
- [x] Add focused lifecycle tests.
- [x] Mark directly covered master plan items complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/local-runtime-lifecycle.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/local-runtime-lifecycle.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
