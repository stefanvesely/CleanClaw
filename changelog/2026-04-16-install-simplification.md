# CleanClaw Install Simplification
**Date:** 2026-04-20
**Plan:** `~/.claude/plans/2026-04-16-cleanclaw-install-simplification.md`

## What changed

### package.json
- Renamed package from `nemoclaw` to `cleanclaw`
- Added `@xenova/transformers: ^2` as production dependency (local embedding model)
- Added `build:cleanclaw` script — compiles `cleanclaw/**/*.ts` to `cleanclaw/dist/` via `tsconfig.cleanclaw.json`
- Fixed `prepublishOnly` — runs `build:cleanclaw` instead of the old `cd nemoclaw && npm install && tsc` sequence
- Added `cleanclaw/dist/` to `files` array so compiled output is included on publish/global install

### tsconfig.cleanclaw.json
- Added `"outDir": "cleanclaw/dist"` so compiled TypeScript lands at a predictable path

### bin/cleanclaw.js
- Fixed shebang from `#!/usr/bin/env -S npx tsx` to `#!/usr/bin/env node`
- Updated all import paths from `../cleanclaw/cli/...` and `../cleanclaw/projectmap/...` to `../cleanclaw/dist/cli/...` and `../cleanclaw/dist/projectmap/...`

### cleanclaw/cli/setup-wizard.ts
- Added embedding provider question (local/openai/ollama-local/vllm-local/http), default `local`
- When `local` selected, triggers `all-MiniLM-L6-v2` model download at init time with progress output
- Writes `embeddings` key to project config

### cleanclaw/projectmap/embedder.ts (new)
- TypeScript port of `embedding.py`
- Providers: `OpenAICompatibleEmbeddingProvider`, `HttpEmbeddingProvider`
- `getProvider(config)` — returns `LocalEmbedder` when provider is `local` or config has no `embeddings` key

### cleanclaw/projectmap/local-embedder.ts (new)
- Wraps `all-MiniLM-L6-v2` via `@xenova/transformers`
- Mean pooling + L2 normalisation, 384-dim output
- Model cached at `~/.cache/huggingface/` on first `init()` call

### cleanclaw/projectmap/store.ts (new)
- TypeScript port of `store.py` — drops FAISS entirely
- JSON-based vector storage with flat cosine similarity
- Functions: `loadTable`, `saveTable`, `removeFileRows`, `queryTable`

### cleanclaw/projectmap/extractor.ts (new)
- TypeScript port of `extractor.py`
- `extractMethods`, `isCodeFile`, `embedTextForMethod`, `embedTextForMisc`

### cleanclaw/projectmap/classifier.ts (new)
- TypeScript port of `classifier.py` — same heuristics keyword sets
- `classifyFile(filePath, layerMap?, extraKeywords?)`

### cleanclaw/projectmap/build.ts (new)
- TypeScript port of `build.py`
- `build(projectRoot, config)` — full project walk, classify, extract, embed, save

### cleanclaw/projectmap/updater-worker.ts (new)
- TypeScript port of `update.py` — incremental re-index for one file

### cleanclaw/projectmap/updater.ts
- Removed `execFileSync('python', ...)` shell-out
- Now calls `update()` from `updater-worker.ts` directly

### cleanclaw/projectmap/query-bridge.ts
- Removed `execFileSync('python', ...)` shell-out
- Now calls `getProvider` + `queryTable` directly from TS modules

### cleanclaw/projectmap/projectmap.test.ts (new)
- Vitest tests: `classifyFile` (6 cases), `extractMethods`, `embedTextForMethod`, `embedTextForMisc`

### cleanclaw/projectmap/updater.test.ts (new)
- Vitest tests ported from `test_update.py`

### Python files deleted
- `embedding.py`, `store.py`, `extractor.py`, `classifier.py`, `build.py`, `update.py`, `query.py`
- `test_build.py`, `test_update.py`, `requirements.txt`

### install.sh
- When `package.json` is present in the same directory (local source install), runs `npm install -g .`
- Falls back to remote `bootstrap_main` path unchanged for curl|bash installs

## Why
- Removes Python dependency entirely — no pip, faiss-cpu, or shell-outs
- `npm install -g cleanclaw` (or `npm install -g .` from source) is now the single install command
- Local embedding model (`all-MiniLM-L6-v2`) replaces FAISS — no API key needed for projectmap operations
- Works on macOS, Linux, and Windows without any Python in PATH

## Follow-ups
- Run `npm install` to pull in `@xenova/transformers`
- Run `npm run build:cleanclaw` to verify TypeScript compilation
- Run `npm test` to verify all Vitest tests pass
