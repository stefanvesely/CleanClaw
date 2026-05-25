# Frontier Reviewer Approval Policy

Timestamp: 2026-05-25 01:57 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/frontier-reviewer-policy.ts`
- `cleanclaw/core/frontier-reviewer-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-frontier-reviewer-approval-policy.md`

## Summary

- Added a frontier reviewer approval gate.
- Frontier reviewer use is allowed for exact approved purposes.
- Frontier reviewer use is also allowed for explicitly configured phases.
- Unapproved and unconfigured reviewer use is blocked.

## Why

Frontier reviewer routing should be powerful but never hidden. The user must approve the purpose or configure the phase before CleanClaw can use it.

## Validation

- `npx.cmd vitest run cleanclaw/core/frontier-reviewer-policy.test.ts cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
