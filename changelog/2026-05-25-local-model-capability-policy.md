# Local Model Capability Policy

Timestamp: 2026-05-25 01:45 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/local-model-policy.ts`
- `cleanclaw/core/local-model-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-local-model-capability-policy.md`

## Summary

- Added a local model policy helper for approved low-risk planning support purposes.
- Allowed summarization, inspection, why drafting, plan drafting, file-scope suggestion, stack classification, and low-risk suggestions.
- Unknown, medium/high risk, or too-broad local-only requests now recommend escalation instead.

## Why

CleanClaw should be local-first without letting the local model drift into unbounded coding or hidden execution decisions.

## Validation

- `npx.cmd vitest run cleanclaw/core/local-model-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
