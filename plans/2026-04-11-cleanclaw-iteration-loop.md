# CleanClaw — Iteration Loop with LLM Scope Guard

**Date:** 2026-04-11
**Project:** CleanClaw (`C:/Users/StefanVesely/source/repos/Work/CleanClaw/`)

## Code Style Constraints
- Write simple, readable code — prefer direct obvious logic over clever abstractions
- Do not introduce utility abstractions unless clearly needed
- Only make changes explicitly requested — don't refactor surrounding code
- One logical change per step — no bundling
- All new TypeScript is ESM (`.js` extensions in imports)
- No `any` types — prefer explicit interfaces
- No external dependencies beyond the existing stack

---

## Objective

Add an iteration loop to the CleanClaw pipeline so that after each task execution, the system can generate a follow-up plan (next iteration) and execute it, while guarding against scope drift between iterations.

The A-variant plan (the original task) is the canonical scope boundary. Each new iteration's generated plan is compared to it by an LLM scope guard before execution is permitted.

---

## Scope Boundary

- Changes are confined to `cleanclaw/core/pipeline.ts`, `cleanclaw/core/boss-agent.ts`, `cleanclaw/plans/variant-manager.ts`, and a new `cleanclaw/core/scope-agent.ts`
- No changes to bridge implementations, CLI, or language agents
- No new external dependencies

---

## Steps

### Step 1 — Add iteration state to CleanClawState

**File:** `cleanclaw/core/state-manager.ts`

Add an `iterationCount` field to the `CleanClawState` interface. This tracks how many iterations have been executed for the current task so that iteration plans can be labelled and logged correctly.

```typescript
iterationCount: number;  // 0 = initial plan, 1 = first iteration, etc.
```

Initialise to `0` in the `saveState` call inside `boss-agent.ts` when a new task starts.

---

### Step 2 — Add iteration plan generation to the planning agent

**File:** `cleanclaw/core/planning-agent.ts`

Add a second exported function `generateIterationPlan` that accepts:
- `originalPlan: string` — the A-variant plan markdown (objective + scope boundary)
- `taskDescription: string` — the original task goal
- `completedSteps: string[]` — steps from the prior iteration that were approved and applied

It sends these to the bridge with a system prompt instructing the LLM to generate the *next* iteration's plan in the same markdown format as the original. The function returns a raw markdown string. It does not write the file — that remains the plan writer's job.

---

### Step 3 — Add LLM scope guard (ScopeAgent)

**File:** `cleanclaw/core/scope-agent.ts` (new file)

Replace the originally planned keyword-based `checkScopeDrift()` heuristic with an LLM bridge call.

When a new iteration plan is generated, `ScopeAgent.assess()` is called before execution. It sends three inputs to the bridge:

1. The A-variant plan (objective + scope boundary section)
2. The original task description
3. The new iteration's generated plan

The system prompt instructs the LLM to return a JSON assessment in this exact shape:

```typescript
export interface ScopeAssessment {
  inScope: boolean;
  driftingSteps: Array<{
    stepNumber: number;
    stepDescription: string;
    reason: string;
  }>;
  summary: string;
}
```

`ScopeAgent.assess()` parses the JSON response. If parsing fails, it retries once with the parse error appended. If both attempts fail, it returns a safe default: `{ inScope: false, driftingSteps: [], summary: "Scope assessment failed — treating as out of scope. Please review manually." }`.

The caller (pipeline.ts) checks the result:
- If `inScope: true` — proceed to execution
- If `inScope: false` — present the `summary` and `driftingSteps` to the user, and require explicit approval (`y`/`n`) before execution proceeds

The `ScopeAgent` class takes a `Bridge` instance in its constructor. No new bridge abstraction is introduced — it reuses the same bridge already in use for the current session.

---

### Step 4 — Wire scope guard into the pipeline

**File:** `cleanclaw/core/pipeline.ts`

After `generateIterationPlan()` produces a new iteration plan and before it is written to disk or executed:

1. Instantiate `ScopeAgent` with the current bridge
2. Call `ScopeAgent.assess()` with the A-variant plan, task description, and new iteration plan
3. If `inScope: true`, continue
4. If `inScope: false`, print the warning to stdout and wait for user input (`y` to proceed, `n` to abort the iteration)
5. If user approves despite drift warning, proceed and log the override in the session log

The `iterationCount` in state is incremented only after the user approves execution (either clean or overridden).

---

### Step 5 — Add iteration plan file naming to the plan writer

**File:** `cleanclaw/plans/plan-writer.ts`

Iteration plans are written with a numeric suffix to distinguish them from the original:

- Original (A-variant): `task01A_plan.md`
- Iteration 1: `task01A_iter1_plan.md`
- Iteration 2: `task01A_iter2_plan.md`

Add an optional `iterationNumber?: number` parameter to `writePlan()`. When provided, it appends `_iter{n}` to the filename. When absent, behaviour is unchanged (backward compatible).

---

### Step 6 — Add iteration loop to boss-agent

**File:** `cleanclaw/core/boss-agent.ts`

After the current task execution completes (all steps approved or skipped), prompt the user:

```
Iteration complete. Generate next iteration? (y/n)
```

If `y`:
1. Call `generateIterationPlan()` with the A-variant plan, task description, and list of completed steps
2. Pass the result through `ScopeAgent.assess()` (Step 3/4 logic)
3. If approved, write the iteration plan file (Step 5 naming), then execute it through the pipeline
4. Repeat until the user answers `n` or there are no further steps proposed

If `n`: exit cleanly, update state with final iteration count.

---

### Step 7 — Unit tests for ScopeAgent

**File:** `cleanclaw/core/scope-agent.test.ts` (new file)

Write vitest tests covering:
- Valid JSON response from bridge → parsed `ScopeAssessment` returned correctly
- `inScope: true` case — no drift steps, summary set
- `inScope: false` case — drift steps populated, summary set
- Malformed JSON on first attempt → retry triggered
- Malformed JSON on both attempts → safe default returned (not a throw)

Use a mock bridge that returns controlled strings — no live API calls in tests.

---

## Files Touched

| File | Action |
|---|---|
| `cleanclaw/core/state-manager.ts` | Updated — add `iterationCount` |
| `cleanclaw/core/planning-agent.ts` | Updated — add `generateIterationPlan` |
| `cleanclaw/core/scope-agent.ts` | New — LLM scope assessment |
| `cleanclaw/core/pipeline.ts` | Updated — wire scope guard before iteration execution |
| `cleanclaw/plans/plan-writer.ts` | Updated — iteration filename suffix |
| `cleanclaw/core/boss-agent.ts` | Updated — iteration loop prompt and orchestration |
| `cleanclaw/core/scope-agent.test.ts` | New — unit tests for ScopeAgent |

---

## Key Design Decision — Step 3

The original plan called for a keyword heuristic in `checkScopeDrift()`. This has been replaced by an LLM bridge call in `ScopeAgent`.

**Why:** Keyword matching cannot reason about *intent*. A step titled "add error handling to login function" would not trigger on keywords like "database" — but if the A-variant scope explicitly excluded authentication, an LLM can identify that as drift. The LLM call uses the same bridge already in the session, so there is no new cost or dependency.

**Trade-off accepted:** LLM scope assessment adds latency per iteration (one extra bridge call). This is acceptable — iteration planning is a deliberate, non-real-time action.

**Failure mode handled:** If the bridge call fails or returns unparseable JSON after one retry, the guard defaults to `inScope: false`, forcing the user to review manually. This is the safe direction — it never silently permits scope drift.
