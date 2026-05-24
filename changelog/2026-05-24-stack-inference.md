# Stack Inference

Timestamp: 2026-05-24 18:38 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/stack-inference.ts`
- `cleanclaw/core/stack-inference.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-stack-inference.md`

## Summary

- Added deterministic stack inference from detected project markers.
- Added ranked candidates with scores, confidence, evidence, and ambiguity notes.
- Added mixed-stack detection.
- Added formatting for best guess and evidence.
- Added focused tests for scoring, framework markers, mixed-stack notes, and missing evidence.

## Reason

CleanClaw should infer project stack from visible evidence before asking users to confirm or override.

## Validation

- `npx.cmd vitest run cleanclaw/core/stack-inference.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
