# Status Project Health

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Expand `cleanclaw status` with active root, config path, ProjectMap status, runtime status, and guardrail status.

## Why

Before CleanClaw acts like a coding agent, the user needs a fast, readable way to confirm which project is attached and which safety/runtime layers are actually present.

## Assumptions

- This slice reports status; it does not start NemoClaw/OpenShell or build ProjectMap.
- ProjectMap status can be inferred from existing project-local files.
- Runtime and guardrail status can report detected environment/config markers without pretending stronger enforcement exists.

## Checklist

- [x] Add reusable project health/status helper if useful.
- [x] Update `cleanclaw status` output.
- [x] Add focused tests.
- [x] Update README and active plan progress.
- [x] Add changelog.
- [x] Validate focused tests/build/status smoke.
- [x] Move plan to complete and commit.

## Validation Plan

- `npx.cmd vitest run cleanclaw/cli/show-status.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

## Validation Results

- `npx.cmd vitest run cleanclaw/cli/show-status.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js status` passed and reported active root, config path, ProjectMap registry-only status, standalone runtime, and software-only guardrails.
