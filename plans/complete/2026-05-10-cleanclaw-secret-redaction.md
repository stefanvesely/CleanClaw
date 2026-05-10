# CleanClaw Secret Redaction

Created: 2026-05-10
Status: Complete

## Assumptions

- CleanClaw plan and log files must never persist obvious provider keys, bearer tokens, or credential-style assignments.
- NemoClaw's canonical token patterns in `src/lib/secret-patterns.ts` should remain the source of truth.
- CleanClaw should redact before writing both Markdown and JSON audit records.

## Checklist

- [x] Add a CleanClaw plan/log redaction helper based on canonical NemoClaw secret patterns.
- [x] Redact generated plan markdown before writing plan files.
- [x] Redact log entry content, session headers, and rollback metadata before appending logs.
- [x] Add focused tests for Markdown logs, JSON logs, session headers, and plan files.
- [x] Run available validation or document blocker.
- [x] Update incomplete-work index and changelog.

## Validation Plan

- `node --check bin/cleanclaw.js` passes.
- Focused Vitest tests were added but not run because `npm` is not available on PATH in this environment.

## Summary

- Added `cleanclaw/plans/secret-redactor.ts` to redact plan/log text with NemoClaw's canonical `SECRET_PATTERNS` plus credential-assignment and bearer-token guards.
- Redacted plan markdown in `writePlan()` before persisting generated plans.
- Redacted Markdown/JSON log entries, session headers, and rollback metadata in `log-writer.ts`.
- Added focused tests for plan file redaction, Markdown logs, JSON logs, session headers, and rollback entries.
