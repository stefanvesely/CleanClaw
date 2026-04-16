# CleanClaw Gaps — Rollback, Resumable Pipeline, Tests, Pluggable Agents, Headless Mode

**Date:** 2026-04-16
**Branch:** main

## What changed

### 1. ProjectMap query wiring

- `cleanclaw/projectmap/query.py` — CLI bridge: embeds query text, calls `query_table`, outputs JSON
- `cleanclaw/projectmap/query-bridge.ts` — `queryProjectMap(text, projectRoot, config, layers, topK)` shells out to `query.py` per layer; returns `[]` silently if `projectMap.enabled` is false or `embeddings` is absent
- `cleanclaw/core/pipeline.ts` — injects enriched task description from ProjectMap results before boss-agent planning call (opt-in via `projectMap.enabled`)

### 2. Rollback (`cleanclaw undo <taskId>`)

- `cleanclaw/cli/undo.ts` — new command: reads `task{id}A_log.json`, reverses entries in order, restores before-states; deletes new files created by the task
  - Warns when files have been modified since the task was applied; prompts to confirm before overwriting
  - Requires `logFormat: json` in config (markdown logs lack structured before-state)
- `cleanclaw/plans/log-writer.ts` — added `appendRollbackEntry(taskId, variant, restoredFiles, plansDir, logFormat)` appended to the task log on successful rollback
- `bin/cleanclaw.js` — new CLI command: `cleanclaw undo <taskId>`
- `cleanclaw/cli/undo.test.ts` — 4 Vitest tests: log parsing, malformed-line skipping, rollback entry filtering, before-state restore

### 3. Resumable pipeline

- `cleanclaw/core/state-manager.ts` — added `resumable: boolean` and `lastCompletedStep: number` to `CleanClawState`
- `cleanclaw/core/pipeline.ts` — saves state with `resumable: true` + `lastCompletedStep` after each applied change; detects incomplete run on next `cleanclaw run` and offers to resume from the last completed step; `runPipelinePerChange` accepts `startStepIndex` param
- `cleanclaw/cli/run-workflow.ts` — clears `resumable: false, lastCompletedStep: 0` on successful task completion so stale resume prompts don't appear on the next run

### 4. Test coverage

- `cleanclaw/scope/scope-precheck.test.ts` — 8 Vitest tests covering all deterministic branches in `precheck()`: 3 inflection points + 5 change-category paths
- `cleanclaw/scope/scope-classifier.test.ts` — 6 Vitest tests: structural/behavioural/new-dependency mappings + unknown category, non-JSON response, and bridge-throws all resolve to `unmapped + halt-confirm`
- `cleanclaw/core/root-guard.test.ts` — 5 Vitest tests: file inside root, file at root itself, outside root, sibling-prefix boundary (the security-critical separator check), error message content
- `cleanclaw/projectmap/test_build.py` — 9 pytest tests: classifier layer routing (backend/frontend/mediator/misc + overrides), extractor method detection, embed-text helpers
- `cleanclaw/projectmap/test_update.py` — 3 pytest tests: FAISS save/load round-trip, `remove_file_rows` filter, no-match case

### 5. Pluggable language agents

- `cleanclaw/config/config-schema.ts` — added `CustomAgentConfig` interface (`stack`, `systemPrompt`) and `customAgents?: CustomAgentConfig[]` to `CleanClawConfig`
- `cleanclaw/core/language-agent.ts` — added `GenericAgent` class: same retry pattern as built-in agents but with a configurable system prompt from config; no code required for new stacks
- `cleanclaw/core/agent-router.ts` — `resolveLanguageAgent` checks `customAgents` first; built-ins remain the fallback
- `CONTRIBUTING.md` — appended CleanClaw section documenting both extension paths (TypeScript agent + config-only custom agent) and the `ProposedChange` schema

### 6. Headless / CI mode

- `cleanclaw/core/verification-layer.ts` — added `autoApprove(proposed)`: returns `approved: true` with agent explanation, logs each auto-approval, no stdin required
- `cleanclaw/core/pipeline.ts` — `headless` param threaded through `runPipeline` → `runPipelinePerChange`; in headless mode: all `promptApproval` calls replaced with `autoApprove`, scope `halt-confirm` exits with code 1, resume and plan-review prompts skipped, new-file creation auto-confirmed
- `cleanclaw/cli/run-workflow.ts` — `headless` param passed through to `runPipeline`
- `bin/cleanclaw.js` — `cleanclaw run <task> --headless` flag added
- `README.md` — new "Headless / CI mode" section with usage and warning

## Why

Six gaps identified after the ProjectMap release:

1. ProjectMap was built but never queried during pipeline execution — wired in now.
2. No way to undo an applied task — `cleanclaw undo` gives a safe, logged rollback path.
3. Interrupted pipelines left no recovery path — resumable state means a crash or Ctrl-C doesn't lose progress.
4. Critical scope-guard and root-guard logic had no unit tests — now covered.
5. New stacks required TypeScript code — `customAgents` in config lets teams add stacks in minutes.
6. No CI integration path — `--headless` makes CleanClaw usable in automated pipelines with scope violations as exit-code failures.
