# CleanClaw NemoClaw Alignment Remaining Work

Created: 2026-04-20
Updated: 2026-05-13T00:00:00+02:00
Status: Incomplete

## Goal

Keep the remaining CleanClaw/NemoClaw parity work visible without repeating completed implementation history.

## Remaining Work

- [x] Validate the CleanClaw blueprint/profile entry against the current NemoClaw blueprint schema.
- [ ] Run live provider smoke tests for `nvidia-nim`, `ollama-local`, `vllm-local`, `anthropic-prod`, and `openai-api`.
- [x] Confirm CleanClaw execution through the NemoClaw/OpenShell path does not bypass session, permission, or sandbox lifecycle checks.
- [x] Resolve the root NemoClaw CLI/Oclif dispatch failure that returned `command root:help not found` / exit code `2` in the gateway trust guidance test.
- [x] Finish the remaining gateway trust guidance validation on Windows, where the fake `openshell` fixture previously did not execute like the POSIX test fixture.

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

The original April plan contained historical implementation steps that are now complete. This file now tracks only the remaining alignment validation and integration gaps.
