# CleanClaw Sandbox Phase 8 Runtime

Timestamp: 2026-05-12

## Changed Files

- `bin/cleanclaw.js`
- `cleanclaw/cli/run-workflow.ts`
- `cleanclaw/core/pipeline.ts`
- `cleanclaw/core/sandbox-policy.ts`
- `cleanclaw/core/sandbox-policy.test.ts`
- `cleanclaw/core/sandbox-runtime.ts`
- `cleanclaw/core/sandbox-runtime.test.ts`
- `src/nemoclaw.ts`
- `plans/incomplete/2026-05-10-cleanclaw-next-work.md`
- `plans/complete/2026-05-12-cleanclaw-sandbox-phase8-runtime.md`

## Summary

- Added a typed sandbox runtime helper for detecting in-sandbox execution, resolving sandbox names, building `openshell sandbox exec` commands, and delegating CleanClaw runs into OpenShell.
- Added `cleanclaw run --sandbox` and `--sandbox-name`.
- NemoClaw `create new dev task` now requests sandbox execution when the onboard session provides a sandbox.
- Updated root policy reporting to distinguish host software-only, host sandbox-capable, and in-sandbox runtime states.
- Added focused tests for sandbox command construction and policy state reporting.

## Reason

CleanClaw needed a concrete Phase 8 runtime path so host execution can hand off to OpenShell and in-sandbox execution can report Landlock-capable enforcement instead of only saying enforcement is pending.

## Validation

- Passed: `git diff --check`.
- Passed: `node --check bin/cleanclaw.js`.
- Blocked: focused Vitest/TypeScript validation was not run because `npm`, `tsc`, and local `node_modules/.bin` tools are unavailable in this environment.
- Not run: live OpenShell sandbox execution, because this environment has no confirmed active OpenShell sandbox for the project.
