# Model Role Policy

Created: 2026-05-25 17:20
Status: Complete
Completed: 2026-05-25 17:21

## Why

CleanClaw needs to route work by role instead of assuming one active provider can safely do everything. This keeps local-first work, coding, reviewing, and planning explicit.

## Assumptions

- This slice adds the core policy helper, not full pipeline routing.
- Existing provider metadata remains the source of known providers.
- Missing reviewer roles should be visible when review is required.

## Checklist

- [x] Add a model role policy helper.
- [x] Support planner, coder, reviewer, local coder, and embedding roles.
- [x] Validate local roles use local providers and required reviewer roles are present.
- [x] Add focused model role policy tests.
- [x] Mark the master plan item complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/model-role-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/model-role-policy.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
