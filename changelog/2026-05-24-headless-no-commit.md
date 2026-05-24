# Headless No Commit Policy

Timestamp: 2026-05-24 11:55 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-git-policy.ts`
- `cleanclaw/core/headless-git-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-headless-no-commit.md`

## Summary

- Added a hard guard that rejects commit attempts during headless execution.
- Allowed non-headless flows to continue to existing explicit commit approval handling.
- Added focused tests for allowed non-headless and rejected headless commit attempts.

## Reason

Repository history must remain under explicit user control; headless execution must never commit automatically.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-git-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
