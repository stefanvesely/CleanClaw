# Sandbox Fallback Prompt

Created: 2026-05-25 21:47
Status: Complete
Completed: 2026-05-25 21:47

## Why

If sandbox execution is requested but unavailable, CleanClaw must ask before falling back to host execution because that changes the safety boundary.

## Assumptions

- This slice adds the user-facing numbered prompt config.
- The existing run workflow already logs sandbox fallback; this prompt policy gives the CLI a controlled choice surface to wire in.
- Host fallback should not be the default when sandbox protection was expected.

## Checklist

- [x] Add sandbox fallback prompt helper.
- [x] Offer retry/start sandbox, continue on host, runtime settings, or stop.
- [x] Add focused tests.
- [x] Mark the master-plan sandbox fallback item complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/sandbox-fallback-prompt.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/sandbox-fallback-prompt.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
