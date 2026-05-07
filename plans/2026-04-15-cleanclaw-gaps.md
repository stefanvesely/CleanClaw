# CleanClaw Gaps Plan
Date: 2026-04-15

## Overview
6 gap items identified across CleanClaw. 25 steps total.

---

## Item 1 — projectMap config key + ProjectMapBuilder wiring

**Steps:**

### 1.1 — `cleanclaw/config/config-schema.ts` — add `projectMap` config key
Add to `CleanClawConfig` interface alongside `embeddings?`:
```typescript
projectMap?: {
  enabled: boolean;
};
```

### 1.2 — `cleanclaw/agents/project-map-builder.ts` — read config flag
In `ProjectMapBuilder`, read `config.projectMap?.enabled` before running. If `false` or undefined, skip and return early.

### 1.3 — `cleanclaw/pipeline.ts` — wire ProjectMapBuilder into pipeline startup
Call `ProjectMapBuilder` at the start of `runPipeline()` when `config.projectMap?.enabled === true`.

---

## Item 2 — Scope guard: per-change classifier in pipeline inner loop

**Steps:**

### 2.1 — `cleanclaw/pipeline.ts` — add scope classifier call per change
In the inner loop (per-change iteration), after change is proposed and before apply, call scope classifier. On classifier failure → halt-confirm.

### 2.2 — `cleanclaw/agents/boss-agent.ts` — add scope check at iteration boundary
In `boss-agent.ts`, add a scope check once per iteration boundary (not per change). On out-of-scope → halt-confirm.

### 2.3 — `cleanclaw/pipeline.ts` — build ApprovedPlanContext at runPipeline() start
Ensure `ApprovedPlanContext` is always constructed at `runPipeline()` start from the resolved plan, not lazily.

---

## Item 3 — Inference config normalisation

**Steps:**

### 3.1 — `cleanclaw/config/inference-config.ts` — create normalisation utility
Create a small utility that normalises provider + model config into a single `InferenceConfig` shape used throughout the pipeline.

### 3.2 — `cleanclaw/agents/boss-agent.ts` — consume normalised InferenceConfig
Replace direct `config.anthropic` / `config.openai` references with the normalised shape.

### 3.3 — `cleanclaw/pipeline.ts` — pass normalised InferenceConfig to all agents
Thread the normalised config through `runPipeline()` so all agents receive it.

---

## Item 4 — Credential handoff

**Steps:**

### 4.1 — `cleanclaw/config/credentials.ts` — create credential resolver
Create a resolver that reads API keys from config, then falls back to environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`).

### 4.2 — `cleanclaw/pipeline.ts` — call credential resolver at startup
At `runPipeline()` start, resolve credentials once and pass them into the agent factory.

### 4.3 — `cleanclaw/agents/boss-agent.ts` — remove direct env var reads
Remove any `process.env.ANTHROPIC_API_KEY` reads inside boss-agent; use injected credentials instead.

---

## Item 5 — Iteration loop correctness

**Steps:**

### 5.1 — `cleanclaw/pipeline.ts` — review iteration termination condition
Audit the iteration loop exit condition. Confirm it exits on: plan complete, halt-confirm, max iterations reached. Add max-iterations guard if missing.

### 5.2 — `cleanclaw/pipeline.ts` — add iteration counter and log
Add a counter that increments each iteration and logs it. Surface iteration count in the run summary.

### 5.3 — `cleanclaw/agents/boss-agent.ts` — confirm halt-confirm propagates correctly
Verify that a halt-confirm signal from scope guard propagates up and exits the iteration loop cleanly (no silent swallow).

---

## Item 6 — Blueprint profiles

**Steps:**

### 6.1 — `cleanclaw/config/config-schema.ts` — add `blueprintProfile` config key
Add to `CleanClawConfig`:
```typescript
blueprintProfile?: string;
```

### 6.2 — `cleanclaw/config/blueprint-profiles/` — create default profiles directory
Create the directory and a `default.ts` profile file with a minimal stack-agnostic blueprint.

### 6.3 — `cleanclaw/config/blueprint-loader.ts` — create profile loader
Load a profile by name from the profiles directory. Fall back to `default` if named profile not found.

### 6.4 — `cleanclaw/pipeline.ts` — load blueprint profile at startup
At `runPipeline()` start, resolve and load the blueprint profile. Pass it into the planner agent.

### 6.5 — `cleanclaw/agents/boss-agent.ts` — consume blueprint profile in planning
Use the loaded blueprint profile to constrain the planning step (layer assignments, conventions).

---

## Code Style Constraints
- Write simple, readable code — prefer direct obvious logic over clever abstractions
- Do not introduce utility abstractions unless clearly needed
- Only make changes explicitly requested — do not refactor surrounding code
- One logical change per step — no bundling
