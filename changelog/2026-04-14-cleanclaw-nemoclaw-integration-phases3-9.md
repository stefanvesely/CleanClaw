# CleanClaw / NemoClaw Integration — Phases 3–9

**Date:** 2026-04-14
**Branch:** main

## What changed

### Phase 3 — Iteration loop foundation
- `cleanclaw/core/state-manager.ts` — added `iterationCount: number` to `CleanClawState` (default 0, backward compatible)
- `cleanclaw/core/planning-agent.ts` — added `generateIterationPlan()`: accepts original plan + completed steps, returns next iteration plan markdown
- `cleanclaw/core/scope-agent.ts` (new) — `ScopeAgent` stub with `assess()` returning safe default (`inScope: true`); wired fully in Phase 5
- `cleanclaw/core/scope-agent.test.ts` (new) — 3 unit tests covering constructor, return shape, safe default

### Phase 4 — Iteration filename suffix
- `cleanclaw/plans/plan-writer.ts` — `writePlan()` accepts optional `iterationNumber?: number`; appends `_iter{n}` before `_plan.md` when set; single-iteration behaviour unchanged

### Phase 5a — Scope guard system
- `cleanclaw/scope/scope-rules.ts` (new) — pure types: `ChangeCategory`, `ScopeAction`, `InflectionPoint`, rule tables (`CATEGORY_ACTIONS`, `INFLECTION_ACTIONS`), `ApprovedPlanContext`, `ScopeDecision`
- `cleanclaw/scope/scope-precheck.ts` (new) — deterministic sync pre-check; resolves ~60–70% of cases without LLM; checks inflection points, infra files, new imports, whitespace-only, declarations vs logic
- `cleanclaw/scope/scope-classifier.ts` (new) — LLM classifier for ambiguous cases; receives `precheckRationale`; failure always returns `unmapped → halt-confirm`
- `cleanclaw/scope/scope-guard.ts` (new) — single public entry point (`checkScope`, `formatHaltMessage`) for both pipeline and boss-agent

### Phase 5b — Pipeline + boss wiring
- `cleanclaw/core/pipeline.ts` — `ApprovedPlanContext` built once at `runPipeline()` start; scope check fires before `promptApproval` per change with `a/r/e` halt prompt; iteration loop added after pipeline completes
- `cleanclaw/core/boss-agent.ts` — `promptNextIteration()` prompts developer, runs iteration-start scope boundary check, generates next plan with `_iter{n}` suffix

### Phase 7 — Setup wizard delegation (opt-in)
- `cleanclaw/config/config-schema.ts` — added `enableWizardDelegation?: boolean`
- `cleanclaw/wizard/wizard-delegator.ts` (new) — `suggestWorkflowAnswers()` generates LLM suggestions for all four workflow questions; returns `null` on failure (fallback to manual)
- `cleanclaw/cli/run-workflow.ts` — when flag set, suggestions shown before each question with Enter-to-accept

### Phase 8+9 — Project root boundary enforcement
- `cleanclaw/config/config-schema.ts` — added `projectRoots?: string[]`
- `cleanclaw/config/default-config.json` — added `"projectRoots": []`
- `cleanclaw/core/root-guard.ts` (new) — `assertWithinProjectRoot()` hard-blocks writes outside active project root (no override, no `a/r/e`); `RootViolationError` named class; `promptDeclareProjectRoot()` first-run prompt
- `cleanclaw/core/sandbox-policy.ts` (new) — `applyRootPolicy()` logs enforcement layer status; degrades gracefully when openshell unavailable; kernel Landlock noted as pending run-inside-container
- `cleanclaw/wizard/wizard-delegator.ts` — `isOpenshellAvailable()` upgraded from stub to real async check via computed dynamic import of `src/lib/resolve-openshell.js`
- `cleanclaw/cli/run-workflow.ts` — first-run prompt for project root declaration; persists via `saveActiveProject()`
- `cleanclaw/core/pipeline.ts` — `applyRootPolicy()` called at startup; `assertWithinProjectRoot()` hard-blocks before every `applyChange()`; `activeRoot` threaded through iteration loop

### Blueprint fix
- `nemoclaw-blueprint/blueprint.yaml` — `cleanclaw` inference profile fixed to conform to `inferenceProfile` schema (replaced `config-delegated` custom fields with valid `anthropic` provider entry)

## Why

These phases complete the core CleanClaw safety and workflow architecture on top of NemoClaw:

- **Iteration loop** enables multi-pass development without losing context or audit trail
- **Scope guard** detects AI drift from the approved plan at each step — software-level task boundary enforcement
- **Project root boundary** is the primary safety wall: AI cannot write outside the declared project directory regardless of what the plan says — hard block, no override
- **Sandbox layer** reports enforcement status and prepares for kernel-level Landlock once CleanClaw runs inside the openshell container (Phase 8 run-in-container, not yet implemented)
- **Wizard delegation** reduces setup friction for experienced users who want LLM-assisted task scoping

## Architecture notes

- All new files in `cleanclaw/` (ESM/NodeNext) — never `src/` (CJS) to avoid rootDir violations
- Cross-boundary calls to `src/lib/` use computed dynamic `import()` paths so TypeScript cannot statically trace them
- `isOpenshellAvailable()` is async and uses a computed dynamic import to reach `src/lib/resolve-openshell.js`
- Scope guard (`cleanclaw/scope/`) and root guard (`cleanclaw/core/root-guard.ts`) are complementary: scope guard catches task drift, root guard catches filesystem boundary violations — different checks, different failure modes
