# Visible Route Change Policy

Timestamp: 2026-05-25 01:38 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/route-change-policy.ts`
- `cleanclaw/core/route-change-policy.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-visible-route-change-policy.md`

## Summary

- Added a route snapshot policy helper for provider, model, gateway, sandbox mode, and sandbox name.
- The helper detects hidden route changes and blocks them unless explicit approval text is supplied.
- Added a formatter so route snapshots can be displayed before approval.

## Why

CleanClaw must make provider/model/sandbox changes visible. The user should know what changed and why before CleanClaw changes routing or runtime boundaries.

## Validation

- `npx.cmd vitest run cleanclaw/core/route-change-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
