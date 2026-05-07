# CleanClaw Unified Integration Plan
Date: 2026-04-12

---

## Phase 0 — CleanClaw Mode Registration (New)

**Goal:** Register CleanClaw as a named blueprint profile in NemoClaw so that `nemoclaw apply --profile cleanclaw` (or a thin `bin/cleanclaw` wrapper) launches NemoClaw with CleanClaw's full architecture active.

**Files affected:**
- `nemoclaw-blueprint/blueprint.yaml` — add `cleanclaw` profile entry
- `src/modes/cleanclaw-mode.ts` (new) — wires CleanClaw components using NemoClaw's already-loaded credential store and inference config
- `src/lib/runner.ts` — add conditional: when profile === `cleanclaw`, activate cleanclaw-mode runtime instead of default sandbox commands
- `bin/cleanclaw` (new, optional) — thin one-line shell wrapper calling `nemoclaw --profile cleanclaw`

**Steps:**
1. Add `cleanclaw` profile block to `nemoclaw-blueprint/blueprint.yaml` under `profiles` and `components.inference.profiles`
2. Create `src/modes/cleanclaw-mode.ts` stub — correct `ModeRuntime` interface, instantiates boss-agent, pipeline, scope-guard, language agents using `getCredential()` and `getProviderSelectionConfig()` from existing NemoClaw modules
3. Add profile dispatch in `runner.ts` — when profile === `cleanclaw`, call `cleanclawMode.run()` instead of default sandbox creation
4. Add `bin/cleanclaw` wrapper script

**Architecture note:**
CleanClaw is a mode of NemoClaw, not a separate application. NemoClaw's infrastructure layer (credentials, inference config, openshell sandbox, SSRF validation, seccomp/Landlock policies) remains active underneath. CleanClaw's component layer (boss-agent, pipeline, scope-guard, language agents, iteration loop) runs on top. This mirrors how OpenClaw worked.

**Guard layering:**
```
nemoclaw --profile cleanclaw
  [NemoClaw infrastructure — always active]
    credentials, inference routing, openshell sandbox,
    network policies, SSRF prevention, Landlock/seccomp
  [CleanClaw mode layer]
    boss-agent → pipeline → per-change scope-guard
    language agents (Dotnet, Svelte, Angular, Blazor)
    iteration loop with LLM scope classifier
```

Degraded mode (no openshell): CleanClaw scope guard remains the only enforcement layer. Document with comment: `// DEGRADED MODE: no sandbox — scope guard is the only enforcement layer`

**Acceptance criteria:**
- `nemoclaw apply --profile cleanclaw` starts without error
- Unknown profile still throws with clear error (existing behaviour preserved)
- `bin/cleanclaw` is callable and routes correctly
- `cleanclaw-mode.ts` stub returns correct shape

---

## Phase 1 — ELIMINATED

`src/lib/credentials.ts` already exists in NemoClaw. `getCredential()`, `saveCredential()`, `ensureApiKey()` are all present. CleanClaw mode uses these directly — no new credential module needed.

---

## Phase 2 — Inference Config Verification

**Goal:** Verify that `src/lib/inference-config.ts` covers CleanClaw's needs. Extend if needed — do not create a parallel module.

**Files affected:**
- `src/lib/inference-config.ts` — extend only if gaps found

**Steps:**
1. Audit `getProviderSelectionConfig()` against the providers CleanClaw needs (anthropic-prod, openai-api, vllm-local at minimum)
2. If gaps: add missing provider entries only — no structural changes
3. Verify `getOpenClawPrimaryModel()` is usable by CleanClaw mode or add a `getCleanClawPrimaryModel()` equivalent

**Acceptance criteria:**
- CleanClaw mode can resolve inference config for all providers it supports
- No duplicate inference config module exists

---

## Phase 3 — Iteration Loop Foundation

**Steps:**

### 3a — Add `iterationCount` to `CleanClawState`
File: `cleanclaw/core/state-manager.ts`
Add `iterationCount: number` to `CleanClawState` interface, defaulting to `0`.

### 3b — Add `generateIterationPlan()` to planning agent
File: `cleanclaw/core/planning-agent.ts`
Second exported function. Accepts `originalPlan: string`, `taskDescription: string`, `completedSteps: string[]`. Calls bridge, returns raw markdown string. Does not write files.

### 3c — New `ScopeAgent` class (stub)
File: `cleanclaw/core/scope-agent.ts` (new)
Constructor takes `Bridge`. Exposes `assess()` returning `ScopeAssessment`. Stub only — wired fully in Phase 5.

### 3d — Unit tests for ScopeAgent stub
File: `cleanclaw/core/scope-agent.test.ts` (new)
Tests: constructor accepts bridge, `assess()` returns correct shape, failure returns safe default.

**Acceptance criteria:**
- `iterationCount: 0` default, no regression
- `generateIterationPlan` callable, returns correct shape
- ScopeAgent stub passes all tests

---

## Phase 4 — Iteration Filename Suffix

File: `cleanclaw/plans/plan-writer.ts`
Add optional `iterationNumber?: number` to `writePlan()`. When set, appends `_iter{n}` before file extension. When absent, behaviour unchanged.

**Acceptance criteria:**
- Single-iteration: filenames unchanged
- Multi-iteration: `task01A_plan.md` → `task01A_iter1_plan.md`

---

## Phase 5a — Scope Guard System

### Architecture decisions (documented in code)
- Scope guard lives in `pipeline.ts` inner loop (per-change), NOT in `boss-agent.ts` as a pre-execution gate
- `boss-agent.ts` calls `checkScope()` once per iteration boundary (`isIterationStart: true`) — coarse sanity check only
- Pipeline checks scope at each step — pilot analogy: pipeline is the pilot checking course at each waypoint, boss is the airport that set the destination
- `ApprovedPlanContext` is always built at `runPipeline()` start — never optional
- Classifier failure → always `unmapped` → `halt-confirm` (never silently proceed)
- Pre-check resolves ~60-70% of checks without LLM calls

### `src/scope/scope-rules.ts`
Pure types and rules. No LLM, no external deps.

6 change categories (lowest → highest suspicion):
- `structural` — class, property, method signature → `proceed`
- `behavioural` — new logic, conditions, data flow → `check-silent`
- `ui-addition` — new component, button, route → `halt-confirm`
- `new-dependency` — new import, new package → `halt-confirm`
- `cross-cutting` — file not in approved plan → `halt-confirm`
- `unmapped` — no parent step identifiable → `halt-confirm`

3 actions: `proceed`, `check-silent`, `halt-confirm`

4 inflection points (override per-change rules, checked first):
- `iteration-start` — beginning of LLM-generated iteration → `check-silent`
- `out-of-plan-file` — file not in `approvedFiles` → `halt-confirm`
- `cumulative-threshold` — 5+ changes in one iteration → `halt-confirm`
- `no-parent-step` — surfaced by classifier returning `unmapped` → `halt-confirm`

### `src/scope/scope-precheck.ts`
Deterministic pre-check. Pure TypeScript, no async, no bridge.

Returns `PrecheckResult { resolved: boolean; action?: ScopeAction; category?: ChangeCategory; inflectionPoint?: InflectionPoint; rationale: string }`

Halt-confirm cases (no LLM needed):
- File not in `approvedFiles`
- Config/infra file not in plan (`package.json`, `tsconfig.*`, `.env*`, `docker-compose.*`)
- New external import detected (regex on diff `+` lines)
- Cumulative change count >= `CUMULATIVE_LIMIT`

Proceed cases (no LLM needed):
- Whitespace/comment/formatting only
- Pure class/interface/enum declaration, no logic body
- Property/field additions only, no conditionals
- Constructor or method signature with trivial body

Check-silent cases (no LLM needed):
- File in `approvedFiles` but diff contains new control flow

Ambiguous → `resolved: false` with rationale string injected into LLM classifier prompt.

### `src/scope/scope-classifier.ts`
LLM classifier. Only called when pre-check returns `resolved: false`.
Receives `precheckRationale` — injected into system prompt so LLM starts from established facts.
Failure → returns `{ category: 'unmapped', action: 'halt-confirm' }`. Never throws.

### `src/scope/scope-guard.ts`
Single public entry point. Both `pipeline.ts` and `boss-agent.ts` call this — neither contains scope logic inline.

Call order:
1. Inflection points (sync, no LLM) — fires first, returns immediately if triggered
2. Pre-check (sync, no LLM) — resolves ~60-70% of cases
3. LLM classifier (async) — only for ambiguous cases, receives precheck rationale
4. Rule match → `ScopeDecision`

User-facing halt message format:
```
This change was not in the approved scope.
  Change:   [description]
  File:     [path]
  Category: [category]
  Reason:   [rationale]
  Rule:     [rule id]

Accept (a) / Reverse (r) / Explain (e):
```
`Explain` option: user types reason → logged to session log → user must also type `a` to proceed.

---

## Phase 5b — Pipeline + Boss Wiring

### `pipeline.ts` inner loop
- Import `scope-guard.ts`
- Build `ApprovedPlanContext` once at `runPipeline()` start
- Per change: call `checkScope()` before applying
- On `halt-confirm`: surface to Stefan, await `a/r/e`
- On `proceed`: apply change
- On `skip`: drop change, log reason

### `boss-agent.ts` iteration loop
After pipeline completes: prompt `Iteration complete. Generate next iteration? (y/n)`

If `y`:
1. `checkScope({ isIterationStart: true }, iterationGoal)` — coarse boundary check
2. If approved: `generateIterationPlan()` → write with suffix (Phase 4) → `runPipeline()` with same `ApprovedPlanContext`
3. Pipeline handles all per-step scope checking internally
4. Repeat until `n` or no steps proposed

`boss-agent.ts` does NOT call the LLM scope classifier directly — it delegates to `scope-guard.ts` which handles the full check. Boss sets destination, pipeline checks course.

---

## Phase 6 — COLLAPSED INTO PHASE 0

Blueprint profile mechanism already exists. The `cleanclaw` profile entry in `blueprint.yaml` IS the blueprint profile mapping for CleanClaw. No separate `blueprint-profiles.ts` needed.

---

## Phase 7 — Setup Wizard Delegation (opt-in, openshell-gated)

Unchanged. Opt-in only (`enableWizardDelegation: boolean`, default false). Gated on openshell availability. Simplified flow is always the fallback.

Files: `src/wizard/setup-wizard.ts` (modify), `src/wizard/wizard-delegator.ts` (new)

---

## Phase 8+9 — Project Root Boundary Enforcement

**Goal:** Prevent CleanClaw from writing files outside the active project root. Two layers: software enforcement (always active), openshell sandbox hardening (when available).

**Why:** The AI can drift outside declared project roots despite planning and scope guard. The scope guard checks task scope — this enforces the filesystem boundary. Complementary, not overlapping.

### Architecture

**Layer 1 — Software enforcement (always active)**
Before `applyChange()` in `pipeline.ts`, resolve the absolute path of the target file and verify it starts with the active project root. If not → hard block. Not user-skippable. No `a/r/e` prompt — this is a safety wall.

**Layer 2 — Openshell sandbox (when available)**
When openshell is installed: apply a Landlock filesystem policy at pipeline startup restricting writes to the active project root.
When openshell is NOT available: software-only enforcement. Code comment: `// DEGRADED MODE: no sandbox — filesystem boundary is software-enforced only`

### Session model

Roots stored in `~/.cleanclaw/config.json` (global). When a root is declared it becomes the active project via `saveActiveProject()`. `assertWithinProjectRoots` checks only the active project root — not the full list. One active project per session.

### Steps

**Step 1 — Add `projectRoots` to config schema**
File: `cleanclaw/config/config-schema.ts`
Add `projectRoots?: string[]` to `CleanClawConfig`.

**Step 2 — Add `projectRoots` to default config**
File: `cleanclaw/config/default-config.json` (or wherever defaults live — check during implementation)
Add `"projectRoots": []`.

**Step 3 — New `cleanclaw/core/root-guard.ts`**
Two exports:
- `assertWithinProjectRoot(filePath: string, activeRoot: string): void` — resolves absolute path, checks it starts with `activeRoot`, throws `RootViolationError` if not. Hard block.
- `promptDeclareProjectRoot(): Promise<string>` — interactive prompt asking user to enter one project root path. Returns the declared root.

**Step 4 — First-run prompt in `run-workflow.ts`**
After loading config and state, if no active project is set (`loadActiveProject()` returns null), call `promptDeclareProjectRoot()`, call `saveActiveProject(root)`, and continue. This happens before any pipeline work.

**Step 5 — Hard block in `pipeline.ts` before `applyChange()`**
In `runPipelinePerChange()`, immediately before `applyChange(proposed)`, call `assertWithinProjectRoot(proposed.filename, activeRoot)`. If it throws: log the violation, skip the step — no halt prompt.

**Step 6 — Fix `isOpenshellAvailable()` to real check**
File: `cleanclaw/wizard/wizard-delegator.ts`
Replace stub `return true` with a computed dynamic import of `resolveOpenshell` from `src/lib/resolve-openshell.ts`. Returns `true` if binary resolves, `false` otherwise.

**Step 7 — New `cleanclaw/core/sandbox-policy.ts`**
Export `applyRootPolicy(activeRoot: string): Promise<void>`.
- If `isOpenshellAvailable()` is false: log degraded mode and return.
- If available: computed dynamic import of `src/lib/policies.ts`. Apply Landlock write-allow for `activeRoot`. On failure: log + continue in degraded mode.
- (Review `policies.ts` internals during implementation before writing the final call.)

**Step 8 — Call `applyRootPolicy()` at pipeline startup**
File: `cleanclaw/core/pipeline.ts`
At top of `runPipeline()`, before `boss.run()`, call `await applyRootPolicy(activeRoot)`.

### Acceptance criteria
- CleanClaw refuses to write any file outside the active project root — no prompt, no override
- On first run with no active project, user is asked to declare a root before execution
- Declared root persists to `~/.cleanclaw/` state so it is not re-asked on subsequent runs
- When openshell NOT installed: software enforcement active, degraded mode logged
- When openshell IS installed: sandbox policy applied at pipeline startup
- `isOpenshellAvailable()` reflects actual binary presence

---

## Execution Order

| Phase | Description | Status |
|---|---|---|
| 0 | CleanClaw Mode Registration | Not started |
| 1 | ELIMINATED — credentials already in NemoClaw | — |
| 2 | Inference Config Verification | Not started |
| 3 | Iteration Loop Foundation | Not started |
| 4 | Iteration Filename Suffix | Not started |
| 5a | Scope Guard System | Not started |
| 5b | Pipeline + Boss Wiring | Not started |
| 6 | COLLAPSED INTO PHASE 0 | — |
| 7 | Setup Wizard Delegation | Not started |
| 8+9 | Project Root Boundary Enforcement | Not started |

---

## Code Style Constraints (apply to every phase)
- Simple, readable code — no clever abstractions
- One logical change per step — no bundling
- All new TypeScript is ESM (.js extensions in imports)
- No `any` types
- No new external dependencies
- Do not refactor surrounding code unless it is the explicit goal of the step
