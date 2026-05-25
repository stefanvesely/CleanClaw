# Expanded Specialist Agent Routes

Timestamp: 2026-05-25 17:17 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/agent-router.ts`
- `cleanclaw/core/agent-router.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-expanded-specialist-agent-routes.md`

## Summary

- Added built-in generic specialist agent routes for every stack/workflow listed in the Phase 4 plan.
- Kept dedicated dotnet, svelte, angular, and blazor agents intact.
- Kept custom agents as the highest-priority route.
- Added route coverage for every built-in generic specialist route.

## Why

CleanClaw needs broad agent routing before users can rely on it across common stacks, workflows, and guardrail domains.

## Validation

- `npx.cmd vitest run cleanclaw/core/agent-router.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
