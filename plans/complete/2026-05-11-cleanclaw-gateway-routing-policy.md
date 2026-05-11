# CleanClaw Gateway Routing Policy

Created: 2026-05-11
Status: Complete
Completed: 2026-05-11

## Assumptions

- `D:\Projects\CC\CleanClaw` is the active project root.
- Embedded NemoClaw/OpenShell runs should consistently route inference through the NemoClaw gateway.
- Standalone CleanClaw should preserve direct provider/local endpoint behavior unless the caller explicitly selects gateway routing.
- Gateway routing should be explicit, testable, and driven by runtime context or an option rather than scattered provider special cases.
- Full Vitest/TypeScript validation may remain blocked until npm/tooling is restored.

## Checklist

- [x] Add an explicit routing policy helper.
- [x] Apply gateway routing before resolving bridges in workflow/pipeline paths.
- [x] Ensure embedded NemoClaw context opts into gateway routing by default.
- [x] Preserve direct/local standalone behavior.
- [x] Add focused tests for policy decisions.
- [x] Run available validation or document blocker.
- [x] Update incomplete-work index and changelog.

## Validation Plan

- Passed `git diff --check`.
- Passed `node --check bin/cleanclaw.js`.
- Passed `rg "console\.|process\.stderr" -n cleanclaw` with no matches.
- Focused Vitest/TypeScript checks were added but not run because `npm`, `tsc`, and local `node_modules/.bin` tools are unavailable in this environment.

## Summary

- Added `cleanclaw/core/gateway-routing.ts` with explicit `auto`, `gateway`, and `direct` routing modes.
- Embedded NemoClaw mode and `create new dev task` now force gateway routing.
- Standalone CleanClaw keeps automatic/direct behavior unless a caller opts into gateway routing.
- Bridge resolution now honors routed `baseURL` values for OpenAI and Anthropic-compatible paths.
- Added focused gateway routing policy tests.
