# Windows Gateway Trust Validation

Created: 2026-05-13T00:00:00+02:00
Completed: 2026-05-13T00:00:00+02:00
Status: complete

## Assumptions

- The remaining local alignment gap is the gateway trust validation on Windows.
- Provider smoke tests still require live services or credentials and should remain tracked in the original incomplete plan.

## Checklist

- [x] Reproduce the failing gateway trust guidance test.
- [x] Make the fake OpenShell fixture executable in the Windows test path without weakening production behavior.
- [x] Run focused CLI and resolver tests.
- [x] Update the remaining alignment plan and changelog.

## Outcome

- `resolveOpenshell` now accepts Windows absolute paths, uses `where.exe openshell` on Windows, keeps POSIX absolute path support, and includes local `~/bin` OpenShell candidates.
- OpenShell `.cmd` and `.bat` wrappers now run through the Windows shell for sync and async spawn helpers.
- The gateway trust CLI fixture writes `openshell.cmd` on Windows and uses `path.delimiter` for PATH composition.
- The original alignment plan now has only live provider smoke tests remaining.

## Validation Plan

- [x] Run `node_modules\.bin\tsc.cmd -p tsconfig.src.json`.
- [x] Run focused resolver/CLI tests for the Windows gateway trust path.
- [x] Run `git diff --check`.
