# CleanClaw — Task Planning Fuzzy Match

**Date:** 2026-04-11
**Project:** CleanClaw (`C:/Users/StefanVesely/source/repos/Work/CleanClaw/`)

## Code Style Constraints
- Write simple, readable code — prefer direct obvious logic over clever abstractions
- Do not introduce utility abstractions unless clearly needed
- Only make changes explicitly requested — don't refactor surrounding code
- One logical change per step — no bundling

## Objective
Add fuzzy/partial matching to the CleanClaw CLI `run-workflow` command so that when Stefan types a task description, it attempts to match against existing saved plans and suggests a match before proceeding. This avoids duplicate plan creation and helps resume prior tasks.

## Steps

### Step 1 — Add plan-list loader utility
**File:** `cleanclaw/core/plan-finder.ts`
- Create a new module that reads `.md` files from the `plansDir` and returns a list of `{ filename, slug }` entries.

### Step 2 — Add fuzzy match function
**File:** `cleanclaw/core/plan-finder.ts`
- Add a `findBestMatch(input: string, slugs: string[]): string | null` function using simple token overlap scoring (no external library).

### Step 3 — Wire match prompt into run-workflow
**File:** `cleanclaw/cli/run-workflow.ts`
- After the task description is collected, call the plan finder.
- If a match is found (score above threshold), ask: "Found existing plan: [slug]. Resume it? (y/n)".
- If yes, load that plan and pass its path into the pipeline.
- If no, continue as normal (new plan).

### Step 4 — Export plan-finder from core index (if applicable)
**File:** `cleanclaw/core/index.ts` (if it exists)
- Add export for `plan-finder` module.
