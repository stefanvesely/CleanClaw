# CleanClaw–NemoClaw Integration Plan
Date: 2026-04-14
Supersedes: 2026-04-12-cleanclaw-unified-integration.md (workflow integration portion)

---

## Code Style Constraints (apply to every phase)
- Simple, readable code — no clever abstractions
- One logical change per step — no bundling
- All new TypeScript is ESM (.js extensions in imports)
- No `any` types
- No new external dependencies
- Do not refactor surrounding code unless it is the explicit goal of the step

---

## Phase 0 — CleanClaw Mode Registration

**Goal:** Register `create` as a global command in NemoClaw so that `nemoclaw create` launches the CleanClaw task-creation flow. Subsequent steps wire the full mode.

**Steps:**

### 0a — Add `"create"` to `GLOBAL_COMMANDS` in `src/nemoclaw.ts`
File: `src/nemoclaw.ts`
Add `"create"` to the `GLOBAL_COMMANDS` Set (line ~66).
Add a `case "create":` stub in the switch at line ~1345 (calls a placeholder or logs "not yet implemented").

### 0b — Add `cleanclaw` profile to `nemoclaw-blueprint/blueprint.yaml`
Add `cleanclaw` profile block under `profiles` and `components.inference.profiles`.

### 0c — Create `src/modes/cleanclaw-mode.ts`
Stub implementing the `ModeRuntime` interface. Instantiates boss-agent, pipeline, scope-guard, language agents using `getCredential()` and `getProviderSelectionConfig()` from existing NemoClaw modules. Returns correct shape.

### 0d — Add profile dispatch in `src/lib/runner.ts`
When profile === `cleanclaw`, call `cleanclawMode.run()` instead of default sandbox creation.

### 0e — Add `bin/cleanclaw` wrapper (optional thin shell script)
One-line wrapper: `nemoclaw --profile cleanclaw "$@"`

**Acceptance criteria:**
- `nemoclaw create` does not throw an unhandled error
- Unknown profile still throws with clear error
- `bin/cleanclaw` is callable and routes correctly
- `cleanclaw-mode.ts` stub returns correct shape

---

## Phase 1 — File Scanner (LLM Re-rank, Option B)

**Goal:** Given a task description, identify the most relevant files in the repo for the task using LLM re-ranking. No keyword scoring, no path matching.

**Design:**
- Run `git ls-files` at the repo root to get all tracked files
- Pass the full file list + task description to the LLM:
  > "Given this task description, which of these files are likely relevant? Return only the file paths, one per line, most relevant first. Limit to 20 files."
- Use `resolveBridge()` from `agent-router.ts` for the LLM call — no new HTTP client
- On LLM failure: fall back to returning the full `git ls-files` list with a warning

**Files affected:**
- `src/lib/file-scanner.ts` (new)

**Steps:**

### 1a — Create `src/lib/file-scanner.ts`
Exports `scanRelevantFiles(taskDescription: string, repoRoot: string): Promise<string[]>`.
Runs `git ls-files` via child_process, calls LLM via `resolveBridge()`, parses response as newline-separated paths.
On LLM failure: logs warning, returns full `git ls-files` list.

### 1b — Unit tests for `file-scanner.ts`
File: `src/lib/file-scanner.test.ts` (new)
Tests: returns ≤20 paths on success, falls back to full list on LLM error, handles empty repo.

**Acceptance criteria:**
- Returns ≤20 file paths ranked by relevance
- Fallback returns full list with logged warning
- No new HTTP client introduced

---

## Phase 2 — Inference Config Verification

**Goal:** Verify `src/lib/inference-config.ts` covers CleanClaw's needs.

**Steps:**
1. Audit `getProviderSelectionConfig()` against providers CleanClaw needs (anthropic-prod, openai-api, vllm-local)
2. If gaps: add missing provider entries only
3. Verify `getOpenClawPrimaryModel()` is usable or add `getCleanClawPrimaryModel()` equivalent

**Acceptance criteria:**
- CleanClaw mode can resolve inference config for all providers it supports
- No duplicate inference config module exists

---

## Phase 3 — Iteration Loop Foundation

### 3a — Add `iterationCount` to `CleanClawState`
File: `cleanclaw/core/state-manager.ts`
Add `iterationCount: number` defaulting to `0`.

### 3b — Add `generateIterationPlan()` to planning agent
File: `cleanclaw/core/planning-agent.ts`
Second exported function. Accepts `originalPlan: string`, `taskDescription: string`, `completedSteps: string[]`. Calls bridge, returns raw markdown string.

### 3c — New `ScopeAgent` class (stub)
File: `cleanclaw/core/scope-agent.ts` (new)
Constructor takes `Bridge`. Exposes `assess()` returning `ScopeAssessment`. Stub only.

### 3d — Unit tests for ScopeAgent stub
File: `cleanclaw/core/scope-agent.test.ts` (new)

**Acceptance criteria:**
- `iterationCount: 0` default, no regression
- `generateIterationPlan` callable, returns correct shape
- ScopeAgent stub passes all tests

---

## Phase 4 — Iteration Filename Suffix

File: `cleanclaw/plans/plan-writer.ts`
Add optional `iterationNumber?: number` to `writePlan()`. When set, appends `_iter{n}` before file extension.

---

## Phase 5a — Scope Guard System

(Unchanged from April 12 plan — architecture decisions, `scope-rules.ts`, `scope-precheck.ts`, `scope-classifier.ts`, `scope-guard.ts` as documented.)

---

## Phase 5b — Pipeline + Boss Wiring

(Unchanged from April 12 plan.)

---

## Phase 7 — Setup Wizard Delegation (opt-in, openshell-gated)

(Unchanged from April 12 plan.)

---

## Phase 8 — Sandbox Execution (DEFERRED)

---

## Phase 9 — Policy Enforcement (NOT INTEGRATING)

---

## Execution Order

| Phase | Description | Status |
|---|---|---|
| 0a | Add `"create"` to GLOBAL_COMMANDS | In progress |
| 0b | Blueprint profile entry | Not started |
| 0c | cleanclaw-mode.ts stub | Not started |
| 0d | runner.ts profile dispatch | Not started |
| 0e | bin/cleanclaw wrapper | Not started |
| 1a | file-scanner.ts (LLM re-rank) | Not started |
| 1b | file-scanner tests | Not started |
| 2 | Inference Config Verification | Not started |
| 3a | iterationCount in CleanClawState | Not started |
| 3b | generateIterationPlan() | Not started |
| 3c | ScopeAgent stub | Not started |
| 3d | ScopeAgent tests | Not started |
| 4 | Iteration Filename Suffix | Not started |
| 5a | Scope Guard System | Not started |
| 5b | Pipeline + Boss Wiring | Not started |
| 7 | Setup Wizard Delegation | Not started |
| 8 | Sandbox Execution | DEFERRED |
| 9 | Policy Enforcement | EXCLUDED |
