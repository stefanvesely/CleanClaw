# Local Runtime Lifecycle Policy

Timestamp: 2026-05-25 17:25

## Why

CleanClaw should only start local LLM runtime when CleanClaw is running, should explain setup problems clearly, and should stop session-owned runtime by default.

## Changed Files

- `cleanclaw/core/local-runtime-lifecycle.ts`
- `cleanclaw/core/local-runtime-lifecycle.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-local-runtime-lifecycle.md`

## Summary

- Added local runtime lifecycle decisions for standalone and NemoClaw/OpenShell-backed local providers.
- Blocked startup before CleanClaw is running.
- Added missing/unconfigured setup guidance.
- Made session-end stop the default unless project settings explicitly keep runtime alive.
- Marked directly covered local runtime lifecycle checklist items complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/local-runtime-lifecycle.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
