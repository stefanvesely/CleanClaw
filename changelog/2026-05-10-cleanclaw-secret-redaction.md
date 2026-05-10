# CleanClaw Secret Redaction

Date: 2026-05-10

## Summary

- Added a CleanClaw plan/log redaction helper backed by NemoClaw's canonical secret patterns.
- Redacted generated plan files before writing them to disk.
- Redacted Markdown and JSON log entries, session headers, and rollback metadata before appending audit records.
- Added focused redaction tests for plan files, Markdown logs, JSON logs, session headers, and rollback entries.

## Validation

- Passed: `node --check bin/cleanclaw.js`
- Blocked: focused Vitest tests were not run because `npm` is not available on PATH in this environment.
