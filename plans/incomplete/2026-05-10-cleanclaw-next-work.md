# CleanClaw Next Work

Created: 2026-05-10
Status: Incomplete
Source: Review of `README.md`, April Claude plan files, changelog entries, and current source tree.

## Assumptions

- `D:\Projects\CC\CleanClaw` is the active project root.
- The old April plan status tables are historical and may be stale.
- Changelog entries plus current source files are treated as the current state of the project.
- This plan tracks product/project work still needed; it does not move or rewrite the historical Claude plans.

## Incomplete Work

- [x] Fix local embedding defaults in setup/query.
  - Completed in `plans/complete/2026-05-10-local-embedding-defaults.md`.
  - `cleanclaw/projectmap/embedder.ts` now falls back to local embeddings when config is omitted.
  - `cleanclaw/projectmap/query-bridge.ts` no longer disables ProjectMap just because `embeddings` is omitted.
  - `cleanclaw/cli/setup-wizard.ts` now presents local as the embedding default.
- [x] Complete NemoClaw credential handoff.
  - Completed in `plans/complete/2026-05-10-nemoclaw-credential-handoff.md`.
  - Added provider-to-env credential resolution with env-first and legacy `~/.nemoclaw/credentials.json` fallback.
  - `cleanclaw/core/config-loader.ts` no longer rejects expanded provider ids during module load.
  - `CleanClawMode` and `runWorkflow()` now inject resolved credentials before the pipeline runs.
- [x] Add secret scanning/redaction before plan and log writes.
  - Completed in `plans/complete/2026-05-10-cleanclaw-secret-redaction.md`.
  - `cleanclaw/plans/secret-redactor.ts` uses NemoClaw's canonical secret patterns plus credential assignment and bearer-token guards.
  - Plan writes, Markdown/JSON log entries, session headers, and rollback metadata are redacted before persistence.
- [x] Replace direct CleanClaw console logging with an injectable/structured logger.
  - Completed in `plans/complete/2026-05-11-cleanclaw-structured-logger.md`.
  - Added `cleanclaw/core/logger.ts` with console, silent, and memory logger implementations.
  - CleanClaw core, CLI helpers, ProjectMap helpers, file scanner, undo, and plan completion warnings now accept/use `CleanClawLogger`.
- [x] Finish NemoClaw session/context handoff.
  - Completed in `plans/complete/2026-05-11-cleanclaw-context-handoff.md`.
  - Added a redacted `CleanClawRuntimeContext` carrying session id, agent/sandbox, gateway/profile, policy presets, auth env, provider/model, active root, and credential presence.
  - `CleanClawMode`, NemoClaw `create new dev task`, workflow, pipeline logs, and CleanClaw state now receive the runtime-context summary.
- [ ] Decide and implement gateway routing policy.
  - CleanClaw currently has mixed direct provider/gateway assumptions.
  - When running inside NemoClaw/OpenShell, route inference through the NemoClaw gateway consistently.
- [ ] Implement sandbox Phase 8 runtime.
  - `cleanclaw/core/sandbox-policy.ts` is software-boundary only today.
  - Run CleanClaw inside OpenShell and apply Landlock enforcement when available.
- [ ] Restore local verification environment.
  - `node` exists, but `npm`, `node_modules`, `dist`, and `cleanclaw/dist` were not available during review.
  - Install dependencies and run build/test once npm is available.
- [ ] Triage `plans/fails.txt`.
  - Existing failure log shows CLI, credentials, and installer-preflight failures that should be reconciled against current code.

## Complete / Mostly Complete

- [x] Core CleanClaw workflow and audit trail foundation.
- [x] Scope guard files and tests are present.
- [x] Root guard and software filesystem boundary are present.
- [x] Iteration planning support is present.
- [x] Provider parity source files are present for NemoClaw provider ids.
- [x] TypeScript ProjectMap port is present.
- [x] Rollback, resumable pipeline, headless mode, and custom agents are present per changelog.

## Validation Plan

- Run `npm install` or restore npm on PATH.
- Run `npm run build:cleanclaw`.
- Run focused tests for setup wizard, ProjectMap query, credential handoff, log writer redaction, and CleanClaw mode.
- Run the broader test suite after focused fixes land.

## Notes

Historical plans in `plans/*.md` are preserved as source material. Treat this file as the current incomplete-work index until individual work items are split into their own plan files.


