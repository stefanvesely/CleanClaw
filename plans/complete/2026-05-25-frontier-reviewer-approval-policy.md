# Frontier Reviewer Approval Policy

Created: 2026-05-25 01:54 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 01:57 Africa/Johannesburg

## Why

Frontier reviewer use can be powerful, but it must not happen silently. CleanClaw should allow it only when the user approved the exact purpose or configured that phase explicitly.

## Assumptions

- This slice adds the policy helper.
- Existing frontier approval records provide exact-purpose approvals.
- Project/phase configuration can be represented as a list of configured phases for now.

## Checklist

- [x] Add frontier reviewer approval gate.
- [x] Allow exact approved purpose.
- [x] Allow explicitly configured phase.
- [x] Block unapproved/unconfigured reviewer use.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused frontier reviewer policy tests.
- Run focused control-contract tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/frontier-reviewer-policy.test.ts cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
