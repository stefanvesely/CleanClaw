# Local Frontier Escalation Policy

Timestamp: 2026-05-25 01:51 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/frontier-escalation-policy.ts`
- `cleanclaw/core/frontier-escalation-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-local-frontier-escalation-policy.md`

## Summary

- Added a local-to-frontier escalation decision helper.
- Local timeout, low/unknown confidence, complex work, and high-risk work now produce escalation reasons.
- The helper creates a numbered prompt offering frontier review, local-only continuation, or stop-and-plan.

## Why

Frontier escalation should be visible and user-controlled, especially when local-first handling is uncertain or risky.

## Validation

- `npx.cmd vitest run cleanclaw/core/frontier-escalation-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
