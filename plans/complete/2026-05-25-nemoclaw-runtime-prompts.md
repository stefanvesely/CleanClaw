# NemoClaw Runtime Prompts

Created: 2026-05-25 17:32
Status: Complete
Completed: 2026-05-25 21:46

## Why

CleanClaw must not silently degrade when NemoClaw/OpenShell is missing or stopped. The user needs clear numbered choices for install/configure, start, standalone, settings, or stop.

## Assumptions

- This slice defines setup/startup prompt policy, not live process management.
- Setup-time and startup-time choices should be reusable by the setup wizard and CLI entrypoint.
- Auto-start remains a project/user setting, with ask-every-time as the default.

## Checklist

- [x] Add NemoClaw/OpenShell setup/startup prompt helper.
- [x] Cover missing runtime setup options.
- [x] Cover installed-but-stopped startup options.
- [x] Cover auto-start preference options.
- [x] Add focused tests.
- [x] Mark covered master-plan items complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/nemoclaw-runtime-prompts.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/nemoclaw-runtime-prompts.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
