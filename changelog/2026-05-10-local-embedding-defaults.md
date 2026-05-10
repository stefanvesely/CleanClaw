# 2026-05-10 - Local Embedding Defaults

Timestamp: 2026-05-10 Africa/Johannesburg

## Changed Files

- `cleanclaw/projectmap/embedder.ts`
- `cleanclaw/projectmap/query-bridge.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `cleanclaw/projectmap/embedding-defaults.test.ts`
- `plans/complete/2026-05-10-local-embedding-defaults.md`
- `plans/incomplete/2026-05-10-cleanclaw-next-work.md`

## Summary

Made local embeddings the default ProjectMap embedding path when no embedding config is supplied. ProjectMap queries now still run when `config.projectMap.enabled` is true and `config.embeddings` is omitted. The setup wizard now presents `local` as the default embedding provider, and focused tests cover the fallback behavior.

## Reason

The install simplification plan promised local embeddings out of the box, but the code still defaulted to OpenAI and skipped ProjectMap query entirely when `embeddings` was omitted.

## Validation

- `node --check bin/cleanclaw.js` passed.
- Focused Vitest/TypeScript validation was not run because `npm` is not on PATH and `node_modules` is absent in this checkout.
