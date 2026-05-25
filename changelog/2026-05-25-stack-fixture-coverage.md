# Stack Fixture Coverage

Timestamp: 2026-05-25 17:25 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/project-markers.ts`
- `cleanclaw/core/project-markers.test.ts`
- `cleanclaw/core/stack-inference.ts`
- `cleanclaw/core/stack-inference.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-stack-fixture-coverage.md`

## Summary

- Expanded deterministic project markers for Angular, Vue, Nuxt, Django, PHP, Laravel, Ruby, Flutter, React Native, Docker, and CI workflows.
- Expanded stack inference for those framework and workflow signals.
- Added fixture coverage for supported stack signals.
- Confirmed existing mixed-stack, unknown fallback, and override persistence tests.

## Why

CleanClaw should infer common project stacks from visible files and be able to explain those choices during setup.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-markers.test.ts cleanclaw/core/stack-inference.test.ts cleanclaw/core/stack-selection.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
