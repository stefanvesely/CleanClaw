# Local-Only Model Guard

Created: 2026-05-25 17:26
Status: Complete
Completed: 2026-05-25 17:26

## Why

If the user chooses local-only work, CleanClaw must not silently route any model role to a frontier provider.

## Assumptions

- The model role policy is the right guard point.
- Local-only should reject default frontier fallbacks as well as explicit frontier routes.
- The user can still choose non-local mode separately.

## Checklist

- [x] Add local-only enforcement to model role policy.
- [x] Reject frontier defaults and explicit frontier routes in local-only mode.
- [x] Add focused tests.
- [x] Mark the master plan item complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/model-role-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/model-role-policy.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
