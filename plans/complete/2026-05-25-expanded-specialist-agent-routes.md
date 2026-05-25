# Expanded Specialist Agent Routes

Created: 2026-05-25 17:12 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 17:17 Africa/Johannesburg

## Why

CleanClaw needs broad specialist-agent coverage before it can feel like a practical coding agent across real projects. The master plan lists stack and workflow agents beyond the current generic routes, so those routes should resolve predictably instead of falling through to unknown-stack errors.

## Assumptions

- Generic agents are acceptable for this slice; dedicated implementations can come later.
- Custom agents must still override built-in agents.
- Each planned route should have a focused routing test.

## Checklist

- [x] Add built-in generic routes for every planned stack/workflow agent.
- [x] Preserve dedicated dotnet/svelte/angular/blazor agents.
- [x] Preserve custom agent priority.
- [x] Add routing test coverage for every planned agent.
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
