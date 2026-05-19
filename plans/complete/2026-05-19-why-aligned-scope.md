# Why-Aligned Scope

Created: 2026-05-19 17:20 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:17 Africa/Johannesburg

## Why

CleanClaw must use the approved task why as a guardrail for proposed files, directories, validation, and later changes. If the why does not clearly support a scope item, CleanClaw should flag it before asking for approval.

## Assumptions

- This slice creates the reusable scope-alignment primitive and shows it in draft plans.
- Deterministic checks should be conservative: clear rationale is aligned, missing rationale is unclear, explicit mismatch is misaligned.
- Future planner/model work can provide richer rationale, but the guardrail should exist now.

## Checklist

- [x] Add a reusable why-alignment helper for proposed scope items.
- [x] Make the helper conservative and easy to audit.
- [x] Add why-alignment output to draft plan formatting.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused why-alignment and session-plan tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/why-alignment.test.ts cleanclaw/core/session-plan.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
