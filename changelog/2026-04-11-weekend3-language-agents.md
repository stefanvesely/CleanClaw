# 2026-04-11 — Weekend 3 Language Agents + Approval Pipeline

## What changed

### Language agents
- `cleanclaw/core/language-agent.ts` — `LanguageAgent` interface and `ProposedChange` type
- `cleanclaw/agents/dotnet-agent.ts` — .NET agent with idiomatic C# prompt, JSON output, retry, code fence stripping
- `cleanclaw/agents/svelte-agent.ts` — Svelte 5 runes-aware agent
- `cleanclaw/agents/angular-agent.ts` — Angular signals + standalone components agent
- `cleanclaw/agents/blazor-agent.ts` — Blazor InteractiveServer agent
- All agents strip markdown code fences before JSON.parse (LLM wraps JSON despite instruction)

### Diff + approval + logging
- `cleanclaw/plans/diff-capture.ts` — reads actual file state from disk; handles new files
- `cleanclaw/core/verification-layer.ts` — interactive Before/After approval prompt with WHY capture
- `cleanclaw/plans/log-writer.ts` — append-only audit log in markdown or JSON format

### Plan system updates
- `cleanclaw/plans/plan-writer.ts` — added `parseTaskPlanSteps()` for numbered list format; `markStepComplete` now warns instead of throwing when heading not found
- `cleanclaw/core/agent-router.ts` — `resolveLanguageAgent()` wired to all four agents

### Pipeline (Step 3.5a)
- `cleanclaw/core/pipeline.ts` — full end-to-end: plan → parse steps → propose → validate filename → approve → apply to disk → log → mark complete
- `applyChange()` handles both new file creation and existing file line replacement

### Smoke test
- `test/smoke/weekend3-smoke.ts` — interactive approval flow, auto-cleans test artefacts

## Result
Weekend 3 milestone: PASS — full pipeline runs end to end with interactive approval, file written to disk, log entry created.

## Next
Weekend 4 — hardening: per-file approval grouping, state manager, variant manager.
