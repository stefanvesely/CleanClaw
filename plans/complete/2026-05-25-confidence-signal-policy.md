# Confidence Signal Policy

Created: 2026-05-25 00:00
Status: Complete
Completed: 2026-05-25 17:16

## Why

CleanClaw should inspire confidence by showing what it knows, what it inferred, and what needs user confirmation. A raw model score does not give the user control; practical confidence signals do.

## Assumptions

- Confidence should be derived from visible project/task signals.
- Low or missing evidence should feed the existing frontier escalation policy.
- This is a core helper slice, not a full runtime model-router implementation.

## Checklist

- [x] Add a practical confidence signal helper.
- [x] Connect confidence signals to frontier escalation input.
- [x] Add focused tests for strong, weak, and blocked confidence states.
- [x] Mark the master plan item complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/confidence-signals.test.ts cleanclaw/core/frontier-escalation-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/confidence-signals.test.ts cleanclaw/core/frontier-escalation-policy.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
