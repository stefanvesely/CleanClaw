# Local Model Capability Policy

Created: 2026-05-25 01:42 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 01:45 Africa/Johannesburg

## Why

CleanClaw is local-first, but the local model needs explicit boundaries. It can help summarize, inspect, draft why/plan/scope, classify stack, and suggest low-risk fixes without becoming an unbounded coder.

## Assumptions

- This slice defines policy, not runtime model execution.
- Local model use should be allowed for planning support and low-risk suggestions.
- Higher-risk coding or broad execution remains outside local-only automatic behavior.

## Checklist

- [x] Define supported local model purposes.
- [x] Allow project summarization, inspection, why draft, plan draft, file scope suggestion, stack classification, and low-risk suggestions.
- [x] Block unknown or higher-risk local model purposes.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused local model capability tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/local-model-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
