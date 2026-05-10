# CleanClaw — NemoClaw Alignment Plan
**Date:** 2026-04-20

## Goal
1. Make all NemoClaw inference providers available in CleanClaw (not just `anthropic` and `openai`)
2. Audit CleanClaw against NemoClaw patterns/restrictions and align where divergent

---

## Phase 1 — Provider Parity

### Current state
`CleanClawConfig.provider` is typed as `'anthropic' | 'openai'` only.
`resolveBridge()` in `agent-router.ts` only handles these two.
`cleanclaw-mode.ts` only reads `PROVIDER_CREDENTIAL_ENV` for anthropic/openai.

### NemoClaw providers to add
From `src/lib/inference-config.ts`:

| Provider ID | Model default | Credential env | Notes |
|---|---|---|---|
| `nvidia-nim` / `nvidia-prod` | `nvidia/nemotron-3-super-120b-a12b` | `OPENAI_API_KEY` | Routes via `inference.local/v1` gateway |
| `openai-api` | `gpt-5.4` | `OPENAI_API_KEY` | Already partially supported |
| `anthropic-prod` | `claude-sonnet-4-6` | `ANTHROPIC_API_KEY` | Already supported, rename from `anthropic` |
| `compatible-anthropic-endpoint` | `custom-anthropic-model` | `COMPATIBLE_ANTHROPIC_API_KEY` | Custom Anthropic-compatible |
| `compatible-endpoint` | `custom-model` | `COMPATIBLE_API_KEY` | Generic OpenAI-compatible |
| `vllm-local` | `vllm-local` | `OPENAI_API_KEY` | Local vLLM |
| `ollama-local` | (from local-inference.ts) | `OPENAI_API_KEY` | Local Ollama |

### Steps

**Step 1 — Expand `CleanClawConfig.provider` type**
File: `cleanclaw/config/config-schema.ts`
Change `provider: 'anthropic' | 'openai'` to include all NemoClaw provider IDs.
Add optional config blocks for `nvidia`, `vllm`, `ollama`, `compatible` endpoints.

**Step 2 — Add NIM/NVIDIA bridge**
File: `cleanclaw/bridges/nvidia-bridge.ts` (new)
NIM uses OpenAI-compatible API — wrap `OpenAiBridge` with the NemoClaw gateway URL (`inference.local/v1`) and NVIDIA model defaults.

**Step 3 — Expand `resolveBridge()` in `agent-router.ts`**
File: `cleanclaw/core/agent-router.ts`
Add cases for all new providers. `vllm-local`, `ollama-local`, `compatible-endpoint` all use OpenAI-compatible bridge with different base URLs.

**Step 4 — Expand `PROVIDER_CREDENTIAL_ENV` in `cleanclaw-mode.ts`**
File: `cleanclaw/modes/cleanclaw-mode.ts`
Add credential env mappings for all new providers.

**Step 5 — Update `setup-wizard.ts` provider question**
File: `cleanclaw/cli/setup-wizard.ts`
Expand the provider prompt to list all supported providers (matching NemoClaw's onboard list). Pull model defaults from a shared constant rather than hardcoding.

**Step 6 — Update `default-config.json`**
File: `cleanclaw/config/default-config.json`
Change default provider from `openai` to `nvidia-nim` (matching NemoClaw's default).

---

## Phase 2 — NemoClaw Alignment Audit

Scan CleanClaw for patterns that diverge from NemoClaw. Areas to check:

### 2a — Credential handling
NemoClaw uses a credential registry (`src/lib/credentials.ts`) with secure storage.
CleanClaw reads API keys directly from config JSON or env vars.
**Action:** Check if CleanClaw should read from NemoClaw's credential registry instead, or at minimum follow the same env var convention.

### 2b — Gateway routing
NemoClaw routes ALL inference through `inference.local/v1` (the OpenShell gateway).
CleanClaw calls providers directly.
**Action:** Decide — should CleanClaw route through the gateway when running inside NemoClaw (profile=cleanclaw), or always call providers directly? If gateway routing is required, `resolveBridge()` needs to respect `INFERENCE_ROUTE_URL`.

### 2c — Blueprint / profile config
NemoClaw blueprint profiles define inference config, sandbox config, and model.
CleanClaw's `blueprint.yaml` entry is minimal.
**Action:** Check `nemoclaw-blueprint/` for any restrictions or required fields that CleanClaw's profile must declare.

### 2d — Sandbox restrictions
NemoClaw sandboxes agent operations. CleanClaw's `sandbox-policy.ts` has a Landlock stub.
**Action:** Audit what NemoClaw's sandbox actually blocks (filesystem, network, syscalls) and ensure CleanClaw's pipeline doesn't violate those restrictions when run inside a sandbox.

### 2e — OpenShell / runner restrictions
`src/nemoclaw.ts` `createDevTask()` now routes through `CleanClawMode` — but the rest of `nemoclaw.ts` has guards, session management, and permission checks.
**Action:** Verify CleanClaw doesn't bypass any NemoClaw session or permission checks during its run.

### 2f — Logging / telemetry
NemoClaw has structured logging. CleanClaw uses `console.log`.
**Action:** Check if CleanClaw should use NemoClaw's logger or if `console.log` is acceptable inside the cleanclaw profile.

---

## Acceptance Criteria
1. `cleanclaw init` presents all NemoClaw providers as options
2. `cleanclaw run` works with `nvidia-nim`, `ollama-local`, `vllm-local`, `anthropic-prod`, `openai-api`
3. No CleanClaw code bypasses NemoClaw sandbox restrictions when run via `nemoclaw apply --profile cleanclaw`
4. Credential env var names match NemoClaw exactly
5. Blueprint profile entry complete and validated against NemoClaw blueprint schema

---

## Notes
- NemoClaw default model: `nvidia/nemotron-3-super-120b-a12b` (not Anthropic)
- NemoClaw gateway URL: `https://inference.local/v1` — this is an internal URL available only inside the OpenShell sandbox
- `OPENAI_API_KEY` is the credential env for NVIDIA NIM (OpenAI-compatible API)
- Phase 2 audit may surface breaking issues — do Phase 1 first, then audit
