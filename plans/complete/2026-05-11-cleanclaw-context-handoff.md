# CleanClaw Context Handoff

Created: 2026-05-11
Status: Complete
Completed: 2026-05-11

## Assumptions

- `D:\Projects\CC\CleanClaw` is the active project root.
- CleanClaw needs a stable runtime-context object that can carry NemoClaw session details without tightly coupling every CleanClaw module to onboard-session internals.
- The first useful slice should pass session id, blueprint/profile information, auth/credential metadata, active root, and selected runtime state into CleanClaw mode/pipeline.
- Full Vitest/TypeScript validation may remain blocked until npm/tooling is restored.

## Checklist

- [x] Inspect NemoClaw onboard session shape and CleanClaw mode entrypoint.
- [x] Add a typed CleanClaw runtime context helper.
- [x] Build runtime context from NemoClaw session/config in CleanClaw mode.
- [x] Pass context into pipeline logs and state where useful.
- [x] Add focused tests for context sanitization/summary behavior.
- [x] Run available validation or document blocker.
- [x] Update incomplete-work index and changelog.

## Validation Plan

- Passed `git diff --check`.
- Passed `node --check bin/cleanclaw.js`.
- Passed `rg "console\.|process\.stderr" -n cleanclaw` with no matches.
- Focused Vitest/TypeScript checks were added but not run because `npm`, `tsc`, and local `node_modules/.bin` tools are unavailable in this environment.

## Summary

- Added `cleanclaw/core/runtime-context.ts` to build, sanitize, summarize, and format CleanClaw runtime context.
- `CleanClawMode` now loads NemoClaw onboard session metadata and passes session/context details into `runPipeline()`.
- NemoClaw `create new dev task` now passes the current onboard session through `runWorkflow()`.
- Pipeline session logs and `.cleanclaw-state.json` can now include a redacted runtime-context summary.
- Added focused runtime-context and log-writer test coverage.
