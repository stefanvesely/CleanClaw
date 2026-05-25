# Local Chat Provider Abstraction

Timestamp: 2026-05-25 17:23

## Why

CleanClaw needs a local chat/coding provider path so small approved coding tasks are not limited to embedding-only local support.

## Changed Files

- `cleanclaw/core/local-chat-provider.ts`
- `cleanclaw/core/local-chat-provider.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-local-chat-provider.md`

## Summary

- Added local chat provider config for `ollama-local` and `vllm-local`.
- Added deterministic OpenAI-compatible chat completions request shape.
- Rejected non-local providers for local chat/coding use.
- Marked the local chat/coding provider abstraction master-plan item complete.

## Validation

- Passed: `npx.cmd vitest run cleanclaw/core/local-chat-provider.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
