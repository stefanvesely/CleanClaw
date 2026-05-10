# 2026-05-10 - NemoClaw Credential Handoff

Timestamp: 2026-05-10 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/credential-resolver.ts`
- `cleanclaw/core/credential-resolver.test.ts`
- `cleanclaw/core/config-loader.ts`
- `cleanclaw/modes/cleanclaw-mode.ts`
- `cleanclaw/cli/run-workflow.ts`
- `plans/complete/2026-05-10-nemoclaw-credential-handoff.md`
- `plans/incomplete/2026-05-10-cleanclaw-next-work.md`

## Summary

Added CleanClaw credential resolution for NemoClaw provider ids. Credentials now resolve from configured values, process environment, or allowlisted legacy `~/.nemoclaw/credentials.json` fallback, then get injected into the bridge config before pipeline execution. The expanded provider ids no longer fail during `config-loader` module load.

## Reason

The project plan identified credential handoff as a blocker: CleanClaw could read env vars directly in one path but did not consistently inject credentials into the bridge config, and the config loader still rejected non-legacy provider ids.

## Validation

- `node --check bin/cleanclaw.js` passed.
- Focused Vitest/TypeScript validation was not run because `npm` is not on PATH and `node_modules` is absent in this checkout.
