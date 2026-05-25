# Confidence Signal Policy

Timestamp: 2026-05-25 17:16

## Why

CleanClaw needs to show practical confidence from visible evidence instead of relying on raw model scores.

## Changed Files

- `cleanclaw/core/confidence-signals.ts`
- `cleanclaw/core/confidence-signals.test.ts`
- `cleanclaw/core/frontier-escalation-policy.ts`
- `cleanclaw/core/frontier-escalation-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-confidence-signal-policy.md`

## Summary

- Added a confidence signal helper that groups confirmed, inferred, missing, and blocked evidence.
- Derived `high`, `medium`, `low`, or `unknown` confidence from practical signals.
- Allowed frontier escalation policy to derive local confidence from those signals when no explicit local confidence value is supplied.
- Marked the Phase 5 confidence-signal master-plan item complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/confidence-signals.test.ts cleanclaw/core/frontier-escalation-policy.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
