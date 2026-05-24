# Numbered Prompt Helper

Timestamp: 2026-05-24 18:27 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/numbered-prompt.ts`
- `cleanclaw/core/numbered-prompt.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-numbered-prompt-helper.md`

## Summary

- Added a reusable numbered prompt formatter and parser.
- Supported number selection, Enter default, typed id fallback, back/cancel/exit controls, and natural-language fallback.
- Added focused tests for all prompt selection paths.
- Marked the corresponding Phase 3 prompt-helper checklist items complete.

## Reason

CleanClaw needs clear numbered menus for non-engineers while preserving natural-language control.

## Validation

- `npx.cmd vitest run cleanclaw/core/numbered-prompt.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
