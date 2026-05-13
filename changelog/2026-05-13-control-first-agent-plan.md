# Control First Agent Plan

Timestamp: 2026-05-13T00:00:00+02:00

## Changed Files

- `README.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `cleanclaw/core/control-contract.ts`
- `cleanclaw/core/control-contract.test.ts`

## Summary

- Reworked the setup/method-of-work plan into a control-first CleanClaw agent architecture.
- Added Phase 0 for the task state machine, approval log, command risk categories, and model escalation gates.
- Refined Phase 0 with the required task "why" guardrail, user-text approval records, granular approvals, local-first reviewer escalation, and headless-mode constraints.
- Expanded the remaining phases into project attachment, planning-first interaction, numbered menus, stack inference, local LLM runtime, NemoClaw guardrail integration, controlled execution, and release documentation/smoke tests.
- Clarified that CleanClaw has local embeddings today but no bundled local chat/coding LLM yet, and should use NemoClaw-backed Ollama/vLLM for local chat/runtime first.
- Saved the full phase-by-phase plan after review with the user.
- Added visible workspace scope trees with root, planned reads, planned edits, planned new files, validation commands, and out-of-root requests.
- Added the re-enterable planning loop so CleanClaw returns to planning after completed work.
- Added ProjectMap/vector DB reuse, freshness manifest, per-project storage, incremental task-completion updates, and the 50 MB warning threshold.
- Added the same-model coder/reviewer warning path for headless mode.
- Added install-time and startup-time NemoClaw health/setup checks.
- Added controlled execution defaults: per-change approval, ask before each validation command, and return to planning after success.
- Clarified that broader approval modes are saved only after the user explicitly requests them for the project.
- Implemented the first Phase 0 control-contract module with lifecycle states, transition guards, why checks, file/read/command/frontier/commit/push guards, approval records, and why-alignment records.
- Added focused tests for task summary requirements, why approval, file scope, outside-root reads/edits, validation command approval, frontier approval, and why-alignment blocking.
- Updated the README top section with all planned next steps from the active plan so the roadmap is visible before the older usage documentation.

## Reason

- CleanClaw must become a NemoClaw-backed coding agent without losing user control. The prior plan described features, but did not yet define the state-machine enforcement model needed to limit agent drift.

## Validation

- Planning-only change; no code validation required.
- Reviewed the saved plan content after writing.
- `npx.cmd vitest run cleanclaw/core/control-contract.test.ts`
- `npm.cmd run build:cleanclaw`
