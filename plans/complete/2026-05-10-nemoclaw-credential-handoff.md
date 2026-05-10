# NemoClaw Credential Handoff

Created: 2026-05-10
Completed: 2026-05-10
Status: Complete

## Assumptions

- CleanClaw must support the expanded provider ids without `config-loader` throwing during module load.
- Provider credentials should resolve from the current process environment first.
- Legacy `~/.nemoclaw/credentials.json` may still exist and can be used as a compatibility fallback for allowlisted provider keys.
- Bridge constructors should continue receiving credentials through `CleanClawConfig`.

## Checklist

- [x] Add a CleanClaw credential resolver for provider-to-env mapping and legacy fallback.
- [x] Stop `config-loader` from rejecting expanded provider ids during module load.
- [x] Inject resolved credentials into `anthropic` or `openai` config blocks before running the pipeline.
- [x] Add focused tests for credential fallback/injection behavior.
- [x] Run available validation or document blocker.
- [x] Update incomplete-work index and changelog.

## Validation

- `node --check bin/cleanclaw.js` passed.
- Focused Vitest and TypeScript validation could not be run because `npm` is not on PATH and `node_modules` is absent.
