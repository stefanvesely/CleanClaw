# Align CleanClaw Provider Metadata

Timestamp: 2026-05-12T19:19:10+02:00

## Changed Files

- `cleanclaw/core/provider-metadata.ts`
- `.gitignore`
- `cleanclaw/core/credential-resolver.ts`
- `cleanclaw/core/agent-router.ts`
- `cleanclaw/core/gateway-routing.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `cleanclaw/core/credential-resolver.test.ts`
- `plans/complete/2026-05-12-align-provider-metadata.md`

## Summary

- Added shared CleanClaw provider metadata for labels, bridge family, credential envs, defaults, and wizard visibility.
- Updated credential resolution, bridge routing, and gateway routing to read from the shared metadata.
- Expanded first-run setup to list NemoClaw provider ids instead of the old `nvidia-nim/ollama` shorthand.
- Aligned local provider credential envs with NemoClaw proxy tokens: `NEMOCLAW_OLLAMA_PROXY_TOKEN` and `NEMOCLAW_VLLM_LOCAL_TOKEN`.
- Ignored `.cleanclaw/projectmap/` runtime state created by local CLI use.

## Reason

- CleanClaw accepted NemoClaw provider ids in config, but setup and local-provider credential mapping were still incomplete. Central metadata reduces the chance that provider defaults drift again.

## Validation

- `node_modules/.bin/tsc.cmd -p tsconfig.cleanclaw.json`
- `node_modules/.bin/vitest.cmd run cleanclaw/core/credential-resolver.test.ts cleanclaw/core/gateway-routing.test.ts`
- `node scripts/write-cleanclaw-dist-package.js`
- `node bin/cleanclaw.js status`
- `git diff --check`
