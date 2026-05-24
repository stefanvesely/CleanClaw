# Stack Inference

Created: 2026-05-24 18:39 Africa/Johannesburg
Status: Complete

Completed: 2026-05-24 18:38 Africa/Johannesburg

## Why

CleanClaw should infer the project stack from deterministic project signals before planning work, then show evidence and ambiguity instead of forcing users to type stack ids.

## Assumptions

- This first slice uses existing detected project markers.
- Confidence should be explainable, not mystical.
- Mixed-stack detection means more than one meaningful stack has evidence.

## Checklist

- [x] Add `stack-inference.ts`.
- [x] Score detected project signals.
- [x] Return ranked candidates with confidence, evidence, and ambiguity notes.
- [x] Detect mixed-stack projects.
- [x] Show best guess and evidence.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused stack inference tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/stack-inference.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
