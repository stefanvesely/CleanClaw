# CleanClaw Sandbox Phase 8 Runtime

Created: 2026-05-12
Status: Complete
Completed: 2026-05-12

## Assumptions

- `D:\Projects\CC\CleanClaw` is the active project root.
- Phase 8 should make sandbox execution explicit and testable before attempting live OpenShell execution.
- CleanClaw should be able to decide whether it is host-only, sandbox-capable, or already running inside a sandbox.
- When a NemoClaw/OpenShell sandbox is available, CleanClaw should be able to build a safe `openshell sandbox exec` command that runs the CleanClaw CLI inside the sandbox with the active project mounted/available.
- Live OpenShell execution may not be possible in this development environment, so validation may be limited to static checks and command-building tests.

## Checklist

- [x] Inspect current sandbox policy and OpenShell runtime helpers.
- [x] Add a typed sandbox runtime helper for mode detection and OpenShell exec command construction.
- [x] Update `sandbox-policy.ts` to report host-only, sandbox-capable, and in-sandbox enforcement states.
- [x] Expose a CleanClaw workflow option for sandbox execution planning.
- [x] Add focused tests for command construction and enforcement-state reporting.
- [x] Run available validation or document blocker.
- [x] Update incomplete-work index and changelog.

## Validation Plan

- Passed `git diff --check`.
- Passed `node --check bin/cleanclaw.js`.
- Focused Vitest/TypeScript checks were added but not run because `npm`, `tsc`, and local `node_modules/.bin` tools are unavailable in this environment.
- Live OpenShell sandbox execution was not run because this environment has no confirmed active OpenShell sandbox for the project.

## Summary

- Added `cleanclaw/core/sandbox-runtime.ts` for in-sandbox detection, sandbox-name resolution, safe OpenShell exec command construction, and delegation.
- Added `--sandbox` and `--sandbox-name` to `cleanclaw run`.
- NemoClaw `create new dev task` now requests sandbox execution when a session sandbox is available.
- Updated `sandbox-policy.ts` to distinguish host software-only, host sandbox-capable, and in-sandbox runtime states.
- Added focused tests for sandbox runtime command construction and root policy state reporting.
