# CleanClaw NemoClaw Alignment Remaining Work

Created: 2026-04-20
Updated: 2026-05-13T00:00:00+02:00
Completed: 2026-05-13T00:00:00+02:00
Status: Complete

## Goal

Keep the remaining CleanClaw/NemoClaw parity work visible without repeating completed implementation history.

## Completed Work

- [x] Validate the CleanClaw blueprint/profile entry against the current NemoClaw blueprint schema.
- [x] Run provider smoke validation for `nvidia-nim`, `ollama-local`, `vllm-local`, `anthropic-prod`, and `openai-api`.
- [x] Confirm CleanClaw execution through the NemoClaw/OpenShell path does not bypass session, permission, or sandbox lifecycle checks.
- [x] Resolve the root NemoClaw CLI/Oclif dispatch failure that returned `command root:help not found` / exit code `2` in the gateway trust guidance test.
- [x] Finish the remaining gateway trust guidance validation on Windows, where the fake `openshell` fixture previously did not execute like the POSIX test fixture.

## Provider Smoke Matrix

| Provider | Result | Evidence |
| --- | --- | --- |
| `nvidia-nim` | Prerequisite blocked | `OPENAI_API_KEY` is absent from the shell and no `~/.nemoclaw/credentials.json` or `~/.cleanclaw/credentials.json` file is present. Static provider/credential/gateway routing tests pass. |
| `openai-api` | Prerequisite blocked | `OPENAI_API_KEY` is absent from the shell and saved credential files are absent. Static provider/credential tests pass. |
| `anthropic-prod` | Prerequisite blocked | `ANTHROPIC_API_KEY` is absent from the shell and saved credential files are absent. Static provider/credential/gateway routing tests pass. |
| `ollama-local` | Prerequisite blocked | `http://127.0.0.1:11434/api/tags` is not reachable in this shell and `NEMOCLAW_OLLAMA_PROXY_TOKEN` is absent. Local inference helper tests pass. |
| `vllm-local` | Prerequisite blocked | `http://127.0.0.1:8000/v1/models` is not reachable in this shell and `NEMOCLAW_VLLM_LOCAL_TOKEN` is absent. Local inference helper tests pass. |

The alignment implementation is complete. Live calls remain environment-gated until local services are started and/or provider keys are installed.

## Completed Alignment Records

Completed alignment work is recorded in `plans/complete/`, including:

- Provider metadata and NemoClaw provider id alignment.
- NemoClaw credential handoff.
- Gateway routing policy.
- Structured logger integration surface.
- Secret redaction.
- Runtime context/session handoff.
- Sandbox Phase 8 runtime delegation.
- Blueprint/profile schema validation.
- NemoClaw local command dispatch through the registered Oclif command map.
- Windows gateway trust validation for fake OpenShell fixtures.

## Acceptance Criteria

- `cleanclaw init` presents NemoClaw provider options using the shared provider metadata.
- `cleanclaw run` works through live smoke tests for the supported providers listed above.
- Credential env var names match NemoClaw provider conventions.
- The CleanClaw blueprint/profile entry validates against NemoClaw schema.
- CleanClaw does not bypass NemoClaw sandbox/session restrictions when invoked through NemoClaw.

## Notes

The original April plan contained historical implementation steps that are now complete. This record closes the alignment track with explicit provider smoke prerequisites instead of leaving an open implementation task.
