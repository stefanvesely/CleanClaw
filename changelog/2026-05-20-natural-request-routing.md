# Natural Request Routing

Timestamp: 2026-05-20 20:25 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/request-routing.ts`
- `cleanclaw/core/request-routing.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-20-natural-request-routing.md`

## Summary

- Added natural request routing.
- Routed project questions, plan creation, continuation, review, revision, and cancellation intents.
- Returned confirmation for ambiguous or unknown requests.

## Reason

CleanClaw should accept natural language while still avoiding silent unsafe choices at decision points.

## Validation

- `npx.cmd vitest run cleanclaw/core/request-routing.test.ts cleanclaw/core/project-question.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
