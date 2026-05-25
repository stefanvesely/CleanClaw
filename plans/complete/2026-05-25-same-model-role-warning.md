# Same Model Role Warning

Created: 2026-05-25 01:00 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 01:06 Africa/Johannesburg

## Why

Headless and reviewer workflows need model independence where possible. If the user chooses the same model for coder and reviewer, CleanClaw should allow it only with a clear warning and explicit approval, then record that review independence is reduced.

## Assumptions

- This slice adds the policy and record helper first.
- CLI wiring can call this helper when users configure headless roles.
- Records should be project-local under the task folder.

## Checklist

- [x] Add same-model coder/reviewer policy check.
- [x] Require explicit approval text when coder and reviewer use the same model.
- [x] Record the warning in `model-routing.md`.
- [x] Record the approval in `approval-records.json`.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused headless model role tests.
- Run focused task record tests if touched.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/headless-model-role-policy.test.ts cleanclaw/core/headless-model-roles.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
