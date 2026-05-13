# Finish NemoClaw Provider Smokes

Created: 2026-05-13T00:00:00+02:00
Completed: 2026-05-13T00:00:00+02:00
Status: complete

## Assumptions

- The only remaining NemoClaw alignment item is provider smoke validation for `nvidia-nim`, `ollama-local`, `vllm-local`, `anthropic-prod`, and `openai-api`.
- Live cloud smoke tests require credentials and network access; local provider smoke tests require reachable local services.
- If live prerequisites are missing, the plan should record the exact unavailable prerequisite and close the alignment implementation work rather than leaving stale engineering tasks.

## Checklist

- [x] Identify existing provider validation coverage and runtime smoke entrypoints.
- [x] Run focused provider metadata, credential, gateway routing, and local inference tests.
- [x] Probe local/cloud provider prerequisites without exposing secret values.
- [x] Update the original NemoClaw alignment plan with concrete smoke results.
- [x] Update changelog and validation record.

## Outcome

- Focused provider tests passed for credential mapping, gateway routing, and local inference helper coverage.
- Cloud live calls are blocked by missing `OPENAI_API_KEY` and `ANTHROPIC_API_KEY`.
- Local live calls are blocked by unreachable Ollama and vLLM endpoints and absent local proxy tokens.
- The original NemoClaw alignment plan now records a provider smoke matrix and closes the implementation alignment work.

## Validation Plan

- [x] Run focused CleanClaw provider tests.
- [x] Run focused NemoClaw inference/provider tests if available.
- [x] Probe local endpoints and credential presence.
- [x] Run `git diff --check`.
