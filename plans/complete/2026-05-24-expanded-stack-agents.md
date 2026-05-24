# Expanded Stack Agents

Created: 2026-05-24 18:51 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 18:47 Africa/Johannesburg

## Why

Stack inference should route to useful stack agents beyond the original dotnet/svelte/angular/blazor list, otherwise inferred stacks like node, nextjs, python, go, rust, and java still fail at execution.

## Assumptions

- This slice can use `GenericAgent` prompts for new stacks before dedicated agents exist.
- Existing dedicated agents should remain unchanged.
- Custom agents should still override built-in routes.

## Checklist

- [x] Add generic built-in agents for newly inferred stacks.
- [x] Preserve existing dedicated agents.
- [x] Preserve custom agent override behavior.
- [x] Add focused router tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused agent-router tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/agent-router.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
