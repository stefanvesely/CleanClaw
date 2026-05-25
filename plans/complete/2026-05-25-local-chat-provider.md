# Local Chat Provider Abstraction

Created: 2026-05-25 17:22
Status: Complete
Completed: 2026-05-25 17:23

## Why

CleanClaw needs a local chat/coding model path, not only local embeddings, so small coding tasks can stay local when that is safe and approved.

## Assumptions

- This slice defines provider configuration and request shape, not a live HTTP client.
- Local providers are currently `ollama-local` and `vllm-local`.
- The abstraction should use OpenAI-compatible chat completions because both local provider paths expose that shape.

## Checklist

- [x] Add local chat provider config helper.
- [x] Support local coding/chat request shape.
- [x] Reject non-local providers.
- [x] Add focused tests.
- [x] Mark the master plan item complete.
- [x] Add changelog entry.
- [x] Run focused tests and build validation.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/local-chat-provider.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `npx.cmd vitest run cleanclaw/core/local-chat-provider.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
