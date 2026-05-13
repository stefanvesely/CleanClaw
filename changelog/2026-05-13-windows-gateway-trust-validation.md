# Windows Gateway Trust Validation

Timestamp: 2026-05-13T00:00:00+02:00

## Changed Files

- `src/lib/resolve-openshell.ts`
- `src/lib/resolve-openshell.test.ts`
- `src/lib/openshell.ts`
- `test/cli.test.ts`
- `plans/incomplete/2026-04-20-cleanclaw-nemoclaw-alignment.md`
- `plans/complete/2026-05-13-windows-gateway-trust-validation.md`

## Summary

- Added Windows-aware OpenShell resolution through `where.exe`, Windows absolute path handling, and local `~/bin` candidates.
- Routed `.cmd` and `.bat` OpenShell wrappers through the Windows shell in the OpenShell spawn helpers.
- Updated the gateway-trust CLI fixture to write `openshell.cmd` on Windows and compose PATH with `path.delimiter`.
- Marked the Windows gateway trust validation item complete in the remaining alignment plan.

## Reason

- The remaining NemoClaw alignment test gets past root Oclif dispatch but fails on Windows because the fake `openshell` fixture is POSIX-shaped.

## Validation

- `node_modules\.bin\tsc.cmd -p tsconfig.src.json`
- `node_modules\.bin\vitest.cmd run src/lib/resolve-openshell.test.ts --reporter verbose`
- `node_modules\.bin\vitest.cmd run test/cli.test.ts --testNamePattern "explains unrecoverable gateway trust rotation after restart" --reporter verbose`
- `git diff --check`
