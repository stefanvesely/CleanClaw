# Triage Inline Failure Log

Created: 2026-05-12T19:29:10+02:00
Status: complete
Completed: 2026-05-12T19:38:40+02:00

## Assumptions

- The remaining inline alignment work is to reconcile `plans/incomplete/fails.txt` against the current local verification environment.
- Failures that still reproduce should be fixed; stale failures should be recorded as resolved by current code or environment changes.

## Checklist

- [x] Run the current test suite or the closest available local equivalent.
- [x] Compare live failures with `plans/incomplete/fails.txt`.
- [x] Fix any still-reproducing failures that are scoped enough for this pass.
- [x] Update `plans/incomplete/2026-05-10-cleanclaw-next-work.md` and changelog.

## Findings

- The full Vitest suite did not finish within four minutes in this Windows shell, so focused failure-log suites were used.
- `test/credentials.test.ts` no longer shows the old credential load timeout or stale-env assertion. Current failures are Windows symlink privilege (`EPERM`) and prompt subprocess exits where `status` is `null`.
- `test/install-preflight.test.ts` no longer shows the old CRLF `$'\r'` parse errors. Current failures are broad Windows shell-harness failures where spawned shell results return `status: null` and no stdout/stderr.
- The focused gateway trust CLI test still fails, but because `bin/nemoclaw.js` currently exits through `command root:help not found` / code `2`; this is a root NemoClaw CLI/Oclif dispatch issue outside the CleanClaw provider-alignment slice.
- Focused CleanClaw provider tests pass after the metadata fix.

## Validation Plan

- `node_modules/.bin/vitest.cmd run` timed out after four minutes.
- `node_modules/.bin/vitest.cmd run test/credentials.test.ts --reporter verbose` reproduced only Windows symlink/prompt subprocess failures, not the old timeout/env failures.
- `node_modules/.bin/vitest.cmd run test/install-preflight.test.ts --reporter verbose` reproduced Windows shell-harness failures, not the old CRLF parse errors.
- `node_modules/.bin/vitest.cmd run test/cli.test.ts --testNamePattern "explains unrecoverable gateway trust rotation after restart" --reporter verbose` still fails with exit code `2` instead of `1`.
