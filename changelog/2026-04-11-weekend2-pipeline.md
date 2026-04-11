# 2026-04-11 — Weekend 2 Pipeline

## What changed

### Core pipeline
- `cleanclaw/core/agent-router.ts` — `resolveBridge()` picks Anthropic or OpenAI bridge from config; `resolveLanguageAgent()` stub for Weekend 3
- `cleanclaw/core/planning-agent.ts` — calls LLM with prescriptive system prompt enforcing Objective/Steps/Scope Boundary format, specific file references per step
- `cleanclaw/core/boss-agent.ts` — thin coordinator: delegates to planning agent, writes plan to disk, returns path and content
- `cleanclaw/core/pipeline.ts` — orchestration entry point: resolves bridge, increments task ID, runs boss, surfaces plan path

### Plan system
- `cleanclaw/plans/plan-writer.ts` — `writePlan()` validates format and writes to disk (throws on overwrite); `markStepComplete()` for completion tracking; `parsePlanSteps()` regex parser for `### Step N.Na —` format

### Smoke test
- `test/smoke/weekend2-smoke.ts` — runs full pipeline, auto-cleans previous test plan, verifies plan file written to disk

## Result
Weekend 2 milestone: PASS — full chain confirmed: config → bridge → planning agent → boss → plan file on disk.

Generated plan has real content: Objective, Steps with specific files, Scope Boundary.

## Next
Weekend 3 — language agents, diff capture, approval handler, log writer.
