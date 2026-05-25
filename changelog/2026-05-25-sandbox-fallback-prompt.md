# Sandbox Fallback Prompt

Timestamp: 2026-05-25 21:47

## Why

Host fallback changes the safety boundary, so CleanClaw must ask before continuing without the requested sandbox.

## Changed Files

- `cleanclaw/core/sandbox-fallback-prompt.ts`
- `cleanclaw/core/sandbox-fallback-prompt.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-sandbox-fallback-prompt.md`

## Summary

- Added a numbered prompt for unavailable sandbox fallback.
- Recommended recovering the sandbox before continuing.
- Offered explicit host fallback, runtime settings, and stop options.
- Marked the sandbox host-fallback master-plan item complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/sandbox-fallback-prompt.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
