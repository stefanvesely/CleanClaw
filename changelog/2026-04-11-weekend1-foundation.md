# 2026-04-11 — Weekend 1 Foundation

## What changed

### Project structure
- Created `cleanclaw/` directory tree: `core/`, `bridges/`, `agents/`, `plans/`, `cli/`, `config/`
- Added 21 placeholder `.ts` files across all directories
- Added `cleanclaw/package.json` with `"type": "module"` to scope ESM to CleanClaw code only
- Added `test/smoke/package.json` with `"type": "module"` for smoke tests

### TypeScript config
- Created `tsconfig.cleanclaw.json` — extends root config with `NodeNext` module resolution for CleanClaw
- Created root `tsconfig.json` with project references pointing to both `tsconfig.src.json` and `tsconfig.cleanclaw.json`

### Config system (Steps 1.3a–1.3c)
- `cleanclaw/config/config-schema.ts` — `CleanClawConfig` interface with `provider`, `anthropic`, `openai`, `approvalGranularity`, `logFormat`, `planPath`, `stack`
- `cleanclaw/config/default-config.json` — default values (`provider: openai`, `approvalGranularity: per-file`, `logFormat: markdown`)
- `cleanclaw/core/config-loader.ts` — loads and deep-merges user config over defaults, validates API key, exports `getConfig()`

### Bridge layer (Steps 1.4a–1.4b)
- `cleanclaw/bridges/anthropic-bridge.ts` — `Bridge`, `BridgeMessage`, `BridgeResponse` interfaces + `AnthropicBridge` class
- `cleanclaw/bridges/openai-bridge.ts` — `OpenAiBridge` class implementing the same `Bridge` interface against the OpenAI SDK

### SDKs
- Installed and pinned `@anthropic-ai/sdk@0.88.0` and `openai@6.34.0`
- Pinned `@types/node@25.6.0`

### Security
- `cleanclaw.config.json` added to `.gitignore` — never committed

### Smoke test (Steps 1.5a–1.5c)
- `test/smoke/sdk-import-check.ts` — verifies both SDKs import correctly
- `test/smoke/weekend1-smoke.ts` — live API call through `AnthropicBridge`

## Result
Weekend 1 milestone: PASS — live Anthropic API call confirmed end to end.

## Next
Weekend 1 complete. Proceeding to Weekend 2 — core pipeline and boss/planning agents.
