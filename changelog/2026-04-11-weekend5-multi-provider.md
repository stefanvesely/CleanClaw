# 2026-04-11 — Weekend 5 Multi-Provider + Approval Granularity

## What changed

### config-merger.ts
- Implemented `mergeConfigs(globalConfig, projectConfig)` — shallow spread with second-level merge on `anthropic` and `openai` sub-objects so neither provider block gets wiped

### config-loader.ts
- Now reads `~/.cleanclaw/config.json` as global config (silent if missing)
- Three-layer merge: defaults → global → project
- Uses `mergeConfigs` instead of `deepMerge` for the final merge
- Added `import os from 'os'`

### openai-bridge.ts
- Catches `APIError` from OpenAI SDK
- 401 → `'OpenAI authentication failed. Check your OPENAI_API_KEY.'`
- 429 → `'OpenAI rate limit hit. Wait a moment and try again.'`
- Other → `'OpenAI API error: [status] [message]'`

### verification-layer.ts
- Added `promptApprovalForFile(proposals, befores)` — groups multiple changes to the same file, shows them all, prompts once
- Rejections now return `[user] rejected` (previously `'rejected by developer'` without prefix)
- All log WHY entries now consistently have `[agent]` or `[user]` prefix

### pipeline.ts
- Refactored into `runPipelinePerChange` and `runPipelinePerFile` functions
- `runPipeline` branches on `config.approvalGranularity`
- Added `resolveModel(config)` helper — reads model from correct provider sub-config
- Extracted `validateFilename` and `printSummary` helpers
- `per-file` mode: collects all proposals first, groups by filename, prompts once per file

### smoke test fixes
- `test/smoke/weekend3-smoke.ts` — changed `src/` cleanup to `test/smoke/temp-project/` to avoid deleting NemoClaw source files
- `test/smoke/weekend5-smoke.ts` — same fix; verifies `[agent]`/`[user]` WHY prefix in log

## Already implemented (verified, no changes needed)
- `5.2a` — API key env var fallback was already in config-loader
- `5.3b` — Both bridges already populated `response.model`
- `5.6a` — agent-router already read model from config with correct defaults

## Result
Weekend 5 milestone: PASS — config merger working, per-file approval granularity working, all log entries have WHY prefix.

## Next
Weekend 6 — CLI, project switching, and install script.
