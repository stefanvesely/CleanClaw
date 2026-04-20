# NemoClaw Provider Parity + Alignment Audit
**Date:** 2026-04-20

## What changed

### Provider parity (Phase 1)
CleanClaw previously only supported `anthropic` and `openai`. All NemoClaw inference providers are now available:

| Provider | Bridge | Default model |
|---|---|---|
| `nvidia-nim` / `nvidia-prod` | NvidiaBridge → `inference.local/v1` | `nvidia/nemotron-3-super-120b-a12b` |
| `anthropic-prod` | AnthropicBridge | `claude-sonnet-4-6` |
| `openai-api` | OpenAiBridge | `gpt-4o` |
| `vllm-local` | OpenAiBridge → `localhost:8000` | configurable |
| `ollama-local` | OpenAiBridge → `localhost:11434` | configurable |
| `compatible-endpoint` | OpenAiBridge → configurable URL | configurable |
| `compatible-anthropic-endpoint` | AnthropicBridge → configurable | configurable |

- New `cleanclaw/bridges/nvidia-bridge.ts` — wraps OpenAI SDK with NIM gateway URL and NVIDIA model defaults
- `OpenAiBridge` gains optional `baseUrl` parameter for local/compatible endpoints
- `CleanClawConfig.provider` type expanded to all 7 provider IDs
- `PROVIDER_CREDENTIAL_ENV` updated — `ollama-local` now correctly maps to `OPENAI_API_KEY` (matching NemoClaw)
- Setup wizard now lists all providers with labels; default changed to `nvidia-nim`
- `default-config.json` default provider changed to `nvidia-nim` with `nvidia/nemotron-3-super-120b-a12b`

### NemoClaw alignment audit (Phase 2)
Full audit of CleanClaw against NemoClaw patterns completed. Findings documented in README and memory.

**Blockers identified (not yet fixed):**
- Credentials: CleanClaw reads env vars only — `createDevTask()` must export from NemoClaw registry before calling CleanClaw
- Logging: 105x `console.log()` calls won't be captured by OpenClaw's logger inside NemoClaw

**Concerns identified (not yet fixed):**
- Secret scanner missing before plan/log file writes
- Inference bridges call providers directly, bypassing NemoClaw's gateway when running inside NemoClaw
- No session/auth context passed from NemoClaw to CleanClaw

**Acceptable gaps:**
- Sandbox Landlock enforcement — stubbed, pending Phase 8 (CleanClaw running inside OpenShell container)

## Why
CleanClaw must work with whatever inference provider the NemoClaw user has configured — locking to Anthropic/OpenAI broke compatibility with NVIDIA NIM deployments, which is NemoClaw's primary use case.

## Next steps
See README status banner and `~/.claude/plans/2026-04-20-cleanclaw-nemoclaw-alignment.md` for prioritised fix list.
