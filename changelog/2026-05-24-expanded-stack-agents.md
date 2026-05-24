# Expanded Stack Agents

Timestamp: 2026-05-24 18:47 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/agent-router.ts`
- `cleanclaw/core/agent-router.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-expanded-stack-agents.md`

## Summary

- Added built-in generic agent routes for `node`, `nextjs`, `vite`, `python`, `go`, `rust`, and `java`.
- Preserved dedicated agents for `dotnet`, `svelte`, `angular`, and `blazor`.
- Preserved custom-agent override priority.
- Added focused routing tests.

## Reason

Stack inference should not infer stacks that the agent router cannot execute.

## Validation

- `npx.cmd vitest run cleanclaw/core/agent-router.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
