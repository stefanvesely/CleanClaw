# CleanClaw Gateway Routing Policy

Timestamp: 2026-05-11

## Changed Files

- `cleanclaw/core/gateway-routing.ts`
- `cleanclaw/core/gateway-routing.test.ts`
- `cleanclaw/core/pipeline.ts`
- `cleanclaw/core/agent-router.ts`
- `cleanclaw/bridges/anthropic-bridge.ts`
- `cleanclaw/config/config-schema.ts`
- `cleanclaw/cli/run-workflow.ts`
- `cleanclaw/modes/cleanclaw-mode.ts`
- `src/nemoclaw.ts`
- `plans/incomplete/2026-05-10-cleanclaw-next-work.md`
- `plans/complete/2026-05-11-cleanclaw-gateway-routing-policy.md`

## Summary

- Added a gateway routing policy helper with `auto`, `gateway`, and `direct` modes.
- Applied routing policy before bridge resolution in the CleanClaw pipeline.
- Forced gateway routing for embedded NemoClaw mode and NemoClaw `create new dev task`.
- Preserved automatic/direct behavior for standalone CleanClaw unless a caller opts into gateway routing.
- Updated OpenAI and Anthropic bridge paths to honor routed base URLs.
- Added focused routing policy tests.

## Reason

CleanClaw previously mixed direct and gateway provider assumptions. Embedded NemoClaw/OpenShell runs now route consistently through the NemoClaw gateway while standalone usage remains explicit and predictable.

## Validation

- Passed: `git diff --check`.
- Passed: `node --check bin/cleanclaw.js`.
- Passed: `rg "console\.|process\.stderr" -n cleanclaw` returned no matches.
- Blocked: focused Vitest/TypeScript validation was not run because `npm`, `tsc`, and local `node_modules/.bin` tools are unavailable in this environment.
