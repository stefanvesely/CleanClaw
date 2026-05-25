# NemoClaw Runtime Prompts

Timestamp: 2026-05-25 21:46

## Why

CleanClaw should not silently degrade when NemoClaw/OpenShell is missing or stopped. The user needs clear numbered choices.

## Changed Files

- `cleanclaw/core/nemoclaw-runtime-prompts.ts`
- `cleanclaw/core/nemoclaw-runtime-prompts.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-nemoclaw-runtime-prompts.md`

## Summary

- Added reusable NemoClaw/OpenShell runtime prompt configs.
- Covered setup-time missing runtime choices: install/configure, standalone, or stop.
- Covered setup/startup stopped runtime choices: start, standalone, settings where relevant, or stop.
- Added auto-start preference choices with `ask every time` as the recommended default.
- Marked covered Phase 6 runtime prompt items complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/nemoclaw-runtime-prompts.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
