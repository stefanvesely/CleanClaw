# Headless Local-First Routing

Timestamp: 2026-05-24 11:39 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/headless-model-routing.ts`
- `cleanclaw/core/headless-model-routing.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-headless-local-first-routing.md`

## Summary

- Added headless coder routing by planned file scope, risk, and complexity.
- Routed small, low-risk, tightly scoped tasks to a local coder first.
- Routed broader, riskier, or more complex tasks to a frontier coder.
- Added focused tests for local-first, broad-scope, high-risk, and high-complexity routing.

## Reason

CleanClaw should balance local LLM usage with frontier models instead of defaulting every task to frontier execution.

## Validation

- `npx.cmd vitest run cleanclaw/core/headless-model-routing.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
