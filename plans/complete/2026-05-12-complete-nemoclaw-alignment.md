# Complete NemoClaw Alignment

Created: 2026-05-12T20:01:28+02:00
Completed: 2026-05-12T20:16:00+02:00
Status: complete

## Assumptions

- The locally completable alignment work is blueprint/schema validation, session/sandbox bypass audit, and the root NemoClaw CLI/Oclif dispatch failure.
- Live provider smoke tests may require credentials, local inference services, and/or OpenShell gateway state that may not be available in this shell.
- The remaining gateway-trust assertion is now past the original root Oclif dispatch failure; the local Windows run cannot execute the POSIX-style fake `openshell` fixture used by that test without additional harness work.

## Checklist

- [x] Validate the CleanClaw blueprint/profile entry against current tests/schema.
- [x] Audit the NemoClaw execution path for session/permission/sandbox bypass risks.
- [x] Fix the root NemoClaw CLI/Oclif dispatch failure if it reproduces locally.
- [x] Repair local command help dispatch for registered command classes that are not discoverable through an Oclif package manifest.
- [x] Attempt live/provider smoke validation where local prerequisites are available.
- [x] Update the alignment plan and changelog.

## Outcome

- `test/validate-blueprint.test.ts` passes and confirms the `cleanclaw` blueprint profile is declared and schema-compatible.
- NemoClaw `create new dev task` loads the onboarding session, requests gateway routing, and sets `sandboxExecution: true`; CleanClaw delegates through `openshell sandbox exec --name <sandbox>` when outside the sandbox and marks `CLEANCLAW_IN_SANDBOX=1` only inside that delegated command.
- Root help now dispatches through the local registered command map instead of falling through to an empty Oclif manifest.
- Registered subcommand `--help` output now renders from local command metadata when the package manifest does not expose the class to Oclif.
- Live provider smoke validation remains in the original incomplete alignment plan because this shell does not have all provider credentials/local inference services confirmed.
- Gateway trust guidance now gets past the original `command root:help not found` failure; the remaining focused failure is the Windows fake-OpenShell fixture/output assertion.

## Validation Plan

- [x] Run focused blueprint validation tests.
- [x] Run focused CLI gateway trust/root help tests.
- [x] Run `npm run build:cli` or direct `tsc` equivalent if source changes.
- [x] Run `git diff --check`.
