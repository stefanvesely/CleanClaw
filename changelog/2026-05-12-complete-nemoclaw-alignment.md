# Complete NemoClaw Alignment

Timestamp: 2026-05-12T20:01:28+02:00

## Changed Files

- `plans/complete/2026-05-12-complete-nemoclaw-alignment.md`
- `plans/incomplete/2026-04-20-cleanclaw-nemoclaw-alignment.md`
- `src/lib/oclif-runner.ts`
- `src/lib/oclif-runner.test.ts`

## Summary

- Validated the CleanClaw blueprint profile against the current NemoClaw blueprint tests.
- Audited the CleanClaw-through-NemoClaw execution path and confirmed it carries onboarding session context and delegates through `openshell sandbox exec` when sandbox execution is requested.
- Fixed local registered Oclif command dispatch so root help and registered command classes work even without a generated Oclif command manifest.
- Added local help rendering for registered commands with static metadata, covering common subcommand `--help` cases under the local command map.
- Updated the remaining alignment plan to move completed validation/audit/dispatch work out of the active remaining-work list.

## Reason

- The remaining alignment plan has locally actionable validation and one known CLI dispatch failure.

## Validation

- `node_modules\.bin\tsc.cmd -p tsconfig.src.json`
- `node_modules\.bin\vitest.cmd run src/lib/oclif-runner.test.ts --reporter verbose`
- `node_modules\.bin\vitest.cmd run test/validate-blueprint.test.ts --reporter verbose`
- `node_modules\.bin\vitest.cmd run test/cli.test.ts --testNamePattern "help exits 0|--help exits 0|explains unrecoverable gateway trust rotation after restart" --reporter verbose`
- `git diff --check`

The focused CLI run now passes root and registered command help coverage. One gateway trust assertion still fails on this Windows shell because the test fixture writes a POSIX no-extension fake `openshell`; the CLI now gets past the original `command root:help not found` failure.
