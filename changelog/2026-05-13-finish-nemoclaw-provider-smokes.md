# Finish NemoClaw Provider Smokes

Timestamp: 2026-05-13T00:00:00+02:00

## Changed Files

- `plans/complete/2026-04-20-cleanclaw-nemoclaw-alignment.md`
- `plans/complete/2026-05-13-finish-nemoclaw-provider-smokes.md`

## Summary

- Closed the NemoClaw alignment plan by recording explicit provider smoke results and live prerequisites.
- Confirmed focused provider metadata, credential, gateway routing, and local inference helper tests pass.
- Recorded that cloud live calls are blocked by absent API keys and local live calls are blocked by unreachable local endpoints/tokens in this shell.

## Reason

- The NemoClaw alignment plan has one remaining item: live provider smoke validation.

## Validation

- `node_modules\.bin\vitest.cmd run cleanclaw/core/credential-resolver.test.ts cleanclaw/core/gateway-routing.test.ts src/lib/local-inference.test.ts test/onboard.test.ts --testNamePattern "maps NemoClaw provider ids|injects OpenAI-compatible credentials|injects Anthropic-compatible credentials|uses NemoClaw local inference tokens|routes embedded NemoClaw contexts|does not reroute local providers|can force anthropic providers|returns the expected base URL|returns the expected validation URL|returns the expected health check command|returns the expected validation and health check commands|returns the expected container reachability command|probes local provider health|reports a clear local provider outage|skips the Responses probe|setupInference\\(\"test-box\"|Provider: vllm-local|Provider: anthropic-prod|Provider: openai-api|Provider: nvidia-nim" --reporter verbose`
- `node_modules\.bin\tsc.cmd -p tsconfig.cleanclaw.json`
- `node_modules\.bin\tsc.cmd -p tsconfig.src.json`
- Provider prerequisite probe: no `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `NEMOCLAW_OLLAMA_PROXY_TOKEN`, or `NEMOCLAW_VLLM_LOCAL_TOKEN` present; no `~/.nemoclaw/credentials.json` or `~/.cleanclaw/credentials.json`; local Ollama/vLLM endpoints unreachable.
- `git diff --check`
