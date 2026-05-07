# CleanClaw → NemoClaw Integration Plan
**Date:** 2026-04-11  
**Status:** Draft — for review  
**Scope:** Architectural planning only. No implementation until a phase is explicitly approved.

---

## 1. Current State: What CleanClaw Does Today

CleanClaw is a self-contained proof-of-concept. It:

- Talks directly to Anthropic or OpenAI via thin bridge classes (`AnthropicBridge`, `OpenAiBridge`)
- Reads raw API keys from `~/.cleanclaw/config.json` or `cleanclaw.config.json` — no key vault, no env-var normalisation beyond a simple fallback check
- Has its own setup wizard (`setup-wizard.ts`) that writes a flat JSON config from scratch
- Selects a language agent (`DotnetAgent`, `SvelteAgent`, etc.) via a static map keyed on `config.stack`
- Has no sandbox — changes are applied directly to the working filesystem with no isolation or rollback
- Has no policy system — approval is a simple y/n readline prompt in `verification-layer.ts`
- Has no preflight — the process crashes at config-load time if the API key is missing

---

## 2. What NemoClaw Provides (Relevant Interfaces)

### 2a. Inference Routing (`src/lib/inference-config.ts`)
- `getProviderSelectionConfig(provider, model?)` — returns a `ProviderSelectionConfig` with endpoint URL, credential env var, model, and profile name
- Supports: `nvidia-nim`, `nvidia-prod`, `openai-api`, `anthropic-prod`, `compatible-anthropic-endpoint`, `gemini-api`, `vllm-local`, `ollama-local`, `compatible-endpoint`
- `getOpenClawPrimaryModel()` — produces a fully-qualified model string prefixed with `inference/`
- This is provider-neutral. CleanClaw's hard-coded `if provider === "anthropic"` / `if provider === "openai"` is a strict subset of it.

### 2b. Credential Management (`src/lib/credentials.ts`)
- Stores credentials at `~/.nemoclaw/credentials.json` (mode 600, safe home validation)
- `getCredential(key)` — checks `process.env[key]` first, then falls back to the JSON store
- `saveCredential(key, value)` — normalises CR/whitespace, writes securely
- `ensureApiKey()` — interactive prompt flow for NVIDIA keys specifically; pattern can be extended
- CleanClaw stores raw `apiKey` inside its config JSON with no safety checks, and reads it at module-load time with no error handling beyond a thrown exception.

### 2c. Blueprint Profiles (`nemoclaw-blueprint/blueprint.yaml`)
- Defines four inference profiles: `default` (NVIDIA cloud), `ncp` (NVIDIA NCP), `nim-local`, `vllm`
- Each profile specifies: `provider_type`, `endpoint`, `model`, `credential_env`, optional `timeout_secs`
- Blueprint runner (`nemoclaw/src/blueprint/runner.ts`) loads this YAML and orchestrates sandbox creation
- CleanClaw's `config.stack` (dotnet/svelte/angular/blazor) maps to a different axis than blueprint profiles — profiles are about the inference backend, not the code being edited.

### 2d. OpenShell Sandbox (`src/lib/runner.ts`, `src/lib/resolve-openshell.ts`)
- `run(cmd)` / `runCapture(cmd)` — bash execution within the repo root, with redacted error logging
- `resolveOpenshell()` — finds the `openshell` binary on PATH or in standard fallback paths
- Sandbox execution requires `openshell` to be installed and a sandbox to be provisioned — this is a hard external dependency
- CleanClaw applies changes with `fs.writeFileSync` directly, with no sandbox isolation.

### 2e. Onboarding (`src/lib/onboard.ts`)
- 7-step interactive wizard: memory check, provider selection, credential collection, sandbox creation, policy application, inference validation, usage notice
- Uses `pRetry` for flaky operations, handles non-interactive mode via `NEMOCLAW_NON_INTERACTIVE=1`
- Deeply coupled to NemoClaw's full infrastructure (Docker, openshell binary, NIM, gateway)
- CleanClaw's `setup-wizard.ts` is a 90-line flat readline script; the surface areas are very different.

### 2f. Policy System (`src/lib/policies.ts`)
- Manages `openshell` network policy presets (YAML files under `nemoclaw-blueprint/policies/presets/`)
- `applyPreset(sandboxName, presetName)` — fetches current policy, merges preset, writes back via `openshell policy set`
- This is network-egress control for the sandbox container, not an approval/workflow gate
- CleanClaw's `promptApproval` in `verification-layer.ts` is a developer-facing diff review — a completely different concern.

---

## 3. Overlap and Duplication Analysis

| Concern | CleanClaw (current) | NemoClaw equivalent | Overlap type |
|---|---|---|---|
| Inference dispatch | `AnthropicBridge`, `OpenAiBridge` with direct SDK calls | `inference-config.ts` + `local-inference.ts` + gateway routing | Functional overlap — CleanClaw reimplements a subset |
| Credential storage | Raw `apiKey` in flat JSON at `~/.cleanclaw/config.json` | `credentials.ts` at `~/.nemoclaw/credentials.json` with safety checks | Partial overlap — different paths, NemoClaw's is safer |
| Onboarding | `setup-wizard.ts` (90 lines, readline) | `onboard.ts` (157 KB, 7-step Docker+sandbox flow) | Partial overlap at the UX layer; wildly different scope |
| Stack/agent selection | `agent-router.ts` static map on `config.stack` | `blueprint.yaml` inference profiles | No direct overlap — different axis entirely |
| Change approval | `verification-layer.ts` (y/n diff prompt) | `policies.ts` (network egress YAML for openshell) | No overlap — different concerns mislabelled as related |
| Sandbox execution | None | `runner.ts` + `resolve-openshell.ts` + openshell binary | CleanClaw has a gap; NemoClaw fills it (with complexity) |
| Preflight | None (throws at load time) | `preflight.ts` (port checks, memory, swap) | CleanClaw has a gap; NemoClaw fills it (Linux-centric) |

---

## 4. Phased Integration Plan

The phases are ordered by value delivered vs. risk introduced. Early phases are low-risk substitutions of duplicated code. Later phases introduce real infrastructure dependencies and should be treated as major versions.

---

### Phase 1 — Credential Handoff (Low risk, no new dependencies)

**What changes:**
- `config-loader.ts` stops reading `apiKey` from the flat JSON config
- Instead, calls `credentials.getCredential(key)` where `key` is the env var name for the selected provider (e.g. `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`)
- The `anthropic.apiKey` / `openai.apiKey` fields in `CleanClawConfig` are deprecated — they can remain for backward compat but are no longer the source of truth
- `setup-wizard.ts` stops writing `apiKey` into the config JSON; instead calls `credentials.saveCredential(key, value)` during global config setup

**Integration seam:**
```
config-loader.ts
  → credentials.getCredential(credentialEnv)
  → process.env[credentialEnv] or ~/.nemoclaw/credentials.json
```

**What NemoClaw provides that CleanClaw gets for free:**
- Home-directory safety check (rejects `/tmp`, `/`, `/dev/shm`)
- CR/whitespace normalisation on key values
- env-var-first lookup (no config re-read needed)

**Risk:** Low. The main risk is the creds file moving from `~/.cleanclaw/config.json` to `~/.nemoclaw/credentials.json` — existing users need a one-time migration or a read-from-old-path fallback.

**Blocker:** None. `credentials.ts` is a pure TypeScript module with no Docker/openshell dependency.

---

### Phase 2 — Inference Config Normalisation (Low risk, extends provider support)

**What changes:**
- `agent-router.ts` `resolveBridge()` is replaced with a lookup through `getProviderSelectionConfig()`
- `CleanClawConfig.provider` becomes one of NemoClaw's provider IDs (`anthropic-prod`, `openai-api`, `vllm-local`, etc.) instead of the current `'anthropic' | 'openai'` union
- The bridge class selected is determined by `ProviderSelectionConfig.endpointUrl` and `providerType`:
  - `provider_type === 'anthropic'` → `AnthropicBridge` (or an Anthropic-compat bridge)
  - all others → `OpenAiBridge` pointed at the resolved endpoint URL
- `setup-wizard.ts` lists the NemoClaw provider options instead of the current two-choice `anthropic/openai` prompt

**Integration seam:**
```
agent-router.ts
  → inference-config.getProviderSelectionConfig(provider, model)
  → ProviderSelectionConfig { endpointUrl, credentialEnv, model, providerType }
  → resolveBridgeFromProfile(config: ProviderSelectionConfig): Bridge
```

**What CleanClaw gains:**
- vLLM and Ollama local routing without new bridge code
- NIM and NVIDIA Endpoints support
- Gemini and compatible-endpoint support
- All without touching the `Bridge` interface that the rest of CleanClaw already uses

**Risk:** Low-medium. The config schema changes meaning users need to re-run setup or migrate their `cleanclaw.config.json`. The `Bridge` interface itself is unchanged — only which class is instantiated and with what endpoint URL changes.

**Blocker:** None. `inference-config.ts` is pure TypeScript with no external deps.

---

### Phase 3 — Blueprint Profile Mapping (Medium risk, new config concepts)

**What changes:**
- A new optional field `blueprintProfile` is added to `CleanClawConfig`
- When set, `agent-router.ts` loads the blueprint YAML via `nemoclaw/src/blueprint/runner.ts` `loadBlueprint()` and resolves the inference profile from it rather than from the flat config fields
- `config.stack` (dotnet/svelte/angular/blazor) stays on `CleanClawConfig` — it is orthogonal to inference profile
- `setup-wizard.ts` adds an optional prompt: "Use a NemoClaw blueprint profile? (default/ncp/nim-local/vllm)"
- Blueprint loading is optional and falls back to Phase 2 behaviour if `blueprintProfile` is not set

**Integration seam:**
```
agent-router.ts
  → if config.blueprintProfile:
      loadBlueprint() → InferenceProfile from blueprint.yaml
      → map to ProviderSelectionConfig (adapter needed)
  → else:
      Phase 2 path
```

**What CleanClaw gains:**
- Can be deployed with the same inference profile as the NemoClaw sandbox it runs inside
- Profile-driven config rather than flat fields — easier to switch between environments (dev vs prod vs NIM local)

**Risk:** Medium. `loadBlueprint()` reads a YAML file from the NemoClaw repo root. If CleanClaw is run outside the NemoClaw repo, this path will not exist. The fallback to Phase 2 config mitigates this — but the coupling to the repo layout is a fragility.

**Blocker:** Requires NemoClaw repo to be present alongside CleanClaw in the same monorepo (already true today). Does not require openshell.

---

### Phase 4 — Setup Wizard Delegation (High risk, scope mismatch)

**What changes:**
- `setup-wizard.ts` detects whether openshell is available (`resolveOpenshell()`)
- If openshell is available: offers to run NemoClaw's full 7-step onboard flow for the user, then reads the resulting credential and inference config from `~/.nemoclaw/`
- If openshell is not available: runs the existing CleanClaw-simplified flow (provider + API key + project name)

**Integration seam:**
```
setup-wizard.ts
  → resolveOpenshell() → binary path or null
  → if found: spawn NemoClaw onboard flow (or exec it)
  → else: CleanClaw simplified flow
```

**What CleanClaw gains:**
- Users who are already NemoClaw users don't have to configure CleanClaw separately
- Sandbox creation, policy application, and NIM setup happen through NemoClaw's battle-tested wizard

**Risk:** High. NemoClaw's onboard flow is 157 KB of code with Docker, openshell, pRetry, NIM validation, and gateway management. Delegating to it means CleanClaw's setup experience depends on:
- Docker being installed and running
- openshell binary being present
- Network access to NVIDIA/OpenAI/Anthropic endpoints for validation
- All of NemoClaw's exit paths and error codes being handled by CleanClaw

**Recommendation:** Treat this as opt-in. Never make it the default path. The simplified CleanClaw wizard is the right default for users who just want to run agents against their local codebase with a cloud key.

**Blocker:** openshell must be installed. Docker must be running. This phase cannot be tested without the full NemoClaw infrastructure.

---

### Phase 5 — Sandbox Execution (Very high risk, new infrastructure dependency)

**What changes:**
- After CleanClaw applies a proposed change to disk, it optionally runs the affected file(s) through an openshell sandbox to validate before committing
- The sandbox would run: compile checks, lint, or a targeted test against the changed file
- `pipeline.ts` `applyChange()` gets a post-apply validation step: `runInSandbox(filename, changeType)`
- Uses `runner.ts` `run()` / `runCapture()` and a provisioned sandbox name from config

**Integration seam:**
```
pipeline.ts
  → applyChange(proposed)
  → if config.sandboxValidation:
      validateInSandbox(proposed.filename, openshellBin, sandboxName)
      → if validation fails: prompt user to revert (reverse applyChange)
```

**What CleanClaw gains:**
- Changes can be validated in isolation before they pollute the working tree
- Compile errors or test failures surface before the developer approves the next step

**Risk:** Very high.
- Requires openshell to be installed and a sandbox to be provisioned and running
- Sandbox provisioning is a multi-minute operation (Docker image pull, NIM warm-up, etc.)
- The sandbox validates code in the container context — it needs the same build tools (dotnet SDK, Node, etc.) as the project being edited
- Rollback on failed sandbox validation requires reversing the `applyChange` already written to disk — this needs a proper revert mechanism that CleanClaw does not currently have
- The value proposition only holds for compiled stacks (dotnet, blazor). For Svelte/Angular, the sandbox would need the project's entire node_modules

**Recommendation:** Defer until Phase 1-3 are stable and there is concrete evidence that blind apply-then-review is causing problems. Do not add this complexity to the PoC stage.

**Blocker:** openshell + provisioned sandbox. Hard dependency.

---

### Phase 6 — Policy Enforcement (Deferred, wrong abstraction)

**Assessment:** NemoClaw's `policies.ts` manages network egress YAML for openshell sandbox containers. CleanClaw's `verification-layer.ts` manages developer approval of proposed code diffs. These are not the same concern and should not be conflated.

**If there is a future need for policy-like behaviour in CleanClaw** (e.g. "never allow changes to migration files without a second approval", "block changes to auth-related files"), this should be implemented as a CleanClaw-native rule system, not by calling `applyPreset()` from policies.ts.

**Recommendation:** Do not integrate. Close this item unless a specific policy use case is identified.

---

## 5. Risk Summary

| Phase | Risk | Primary Blocker | Reversible? |
|---|---|---|---|
| Phase 1 — Credentials | Low | None | Yes — add migration path for old config |
| Phase 2 — Inference Config | Low-medium | None | Yes — schema version the config |
| Phase 3 — Blueprint Profiles | Medium | Monorepo layout dependency | Yes — always falls back to Phase 2 |
| Phase 4 — Onboard Delegation | High | openshell + Docker | Yes — keep simplified flow as default |
| Phase 5 — Sandbox Execution | Very high | openshell + provisioned sandbox + build tools | Hard to reverse once in pipeline |
| Phase 6 — Policy Enforcement | N/A — wrong abstraction | N/A | N/A |

---

## 6. Recommended Execution Order

1. **Phase 1** first — credential safety is the most concrete improvement with zero new dependencies
2. **Phase 2** immediately after — extends provider support without touching the Bridge interface
3. **Phase 3** when CleanClaw needs to be deployed inside a NemoClaw sandbox environment
4. **Phase 4** only if/when the user base includes NemoClaw users who find double-setup friction intolerable
5. **Phase 5** only after Phase 1-3 are stable, openshell is available in the dev environment, and there is evidence that unsandboxed apply is causing real problems
6. **Phase 6** never, unless a new policy requirement is identified that is actually about CleanClaw's workflow

---

## 7. Code Style Constraints

For all implementation work in Phases 1-5:
- Write simple, readable code — prefer direct, obvious logic over clever abstractions
- Do not introduce utility abstractions (group maps, complex pipelines, chained projections) unless there is a clear demonstrated need
- Only make changes explicitly requested — do not refactor surrounding code
- One logical change per step — no bundling
