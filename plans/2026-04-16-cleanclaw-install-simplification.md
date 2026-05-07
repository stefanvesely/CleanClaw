# CleanClaw Install Simplification
**Date:** 2026-04-16
**Task:** CleanClaw — single cross-platform npm install + Python projectmap removal + local embedding model

## Code Style Constraints
- Write simple, readable code — prefer direct obvious logic over clever abstractions
- Do not introduce utility abstractions (group maps, complex pipelines, chained projections) unless clearly needed
- Only make changes explicitly requested — don't refactor surrounding code
- One logical change per step — no bundling

---

## Goal
Make `npm install -g cleanclaw` (or `npm install -g .` from source) the single install command.
After install: user runs `cleanclaw init` to supply provider/URL/API key. Nothing else required.

Local embedding (`all-MiniLM-L6-v2` via `@xenova/transformers`) is the default for all lightweight
semantic operations — projectmap indexing, file classification, scope guard precheck, and query
matching. No API key needed for these tasks unless the user explicitly configures an external
embedding provider.

## What this removes
- Python dependency (no pip, no faiss-cpu, no shell-outs to python)
- `scripts/cleanclaw-install.sh` (Unix-only symlink script)
- `cleanclaw/projectmap/requirements.txt`
- All Python `.py` files in `cleanclaw/projectmap/`

## What this adds / changes
- Package renamed `nemoclaw` → `cleanclaw`
- `@xenova/transformers` added as production dependency
- `projectmap/local-embedder.ts` — wraps `all-MiniLM-L6-v2`, produces 384-dim embeddings
- `projectmap/embedder.ts` updated to recognise `local` as a provider; `local` is the default when no embeddings config is supplied
- `cleanclaw init` embedding prompt defaults to `local`; selecting `local` triggers model download at init time
- CleanClaw TypeScript compiled at publish time (not runtime)
- `bin/cleanclaw.js` shebang fixed to `#!/usr/bin/env node`, imports updated to compiled paths
- Python projectmap replaced 1:1 with TypeScript equivalents
- `updater.ts` and `query-bridge.ts` become direct TS function calls (no shell-out)
- Vitest tests replace `test_build.py` and `test_update.py`

---

## Steps

### Step 1 — Rename package in package.json
**File:** `package.json`

Change `"name": "nemoclaw"` → `"name": "cleanclaw"`.
Also update `"description"` to remove "NemoClaw" naming.

### Step 2 — Add `build:cleanclaw` script and fix `prepublishOnly`
**File:** `package.json`

Add a `build:cleanclaw` script that compiles `cleanclaw/**/*.ts` to `cleanclaw/dist/` using `tsconfig.cleanclaw.json`.

Fix `prepublishOnly`:
- Remove the current `cd nemoclaw && env -u ... npm install && ./node_modules/.bin/tsc` sequence
- Replace with: `npm run build:cleanclaw`
- Wire into `prepublishOnly` alongside any existing `build:cli` step

### Step 3 — Add `outDir` to `tsconfig.cleanclaw.json`
**File:** `tsconfig.cleanclaw.json`

The existing file includes `cleanclaw/**/*.ts` but has no `outDir`. Add `"outDir": "cleanclaw/dist"` so compiled output lands at a predictable path.

### Step 4 — Fix `bin/cleanclaw.js` shebang
**File:** `bin/cleanclaw.js`

Change shebang from `#!/usr/bin/env -S npx tsx` → `#!/usr/bin/env node`.

### Step 5 — Update `bin/cleanclaw.js` import paths to compiled output
**File:** `bin/cleanclaw.js`

Change all `import(...)` paths from `../cleanclaw/cli/...` → `../cleanclaw/dist/cli/...` and `../cleanclaw/projectmap/...` → `../cleanclaw/dist/projectmap/...`.

The file currently uses dynamic imports with `.js` extensions already — just update the directory segment.

### Step 6 — Update setup-wizard.ts — add embedding provider/URL/key questions
**File:** `cleanclaw/cli/setup-wizard.ts`

Add the following questions to the init flow (in order, after model/provider questions):
1. `Embedding provider (local/openai/ollama-local/vllm-local/http) [local]:` — default `local`
2. If not `local`: `Embedding base URL:` and `Embedding API key:`

Write the answers into the project config under an `embeddings` key.

### Step 7 — Create `projectmap/embedder.ts`
**File:** `cleanclaw/projectmap/embedder.ts`

TypeScript port of `embedding.py`. Direct translation:
- `OpenAICompatibleEmbeddingProvider` — uses the existing `openai` npm package
- `HttpEmbeddingProvider` — uses Node.js built-in `fetch`
- `getProvider(config)` — same logic as `get_provider()` in Python; provider names: `openai`, `vllm-local`, `ollama-local`, `http`

No local provider wired in yet — that comes in Step 10.

### Step 8 — Add `@xenova/transformers` to production dependencies
**File:** `package.json`

Add `"@xenova/transformers": "^2"` (or latest stable `^2.x`) to `"dependencies"`.

This is a pure JavaScript/WASM package — no native build step, no Python, works on all platforms.

### Step 9 — Create `projectmap/local-embedder.ts`
**File:** `cleanclaw/projectmap/local-embedder.ts`

Wraps `all-MiniLM-L6-v2` via `@xenova/transformers`. Implements the same interface as the API embedder:

```
export class LocalEmbedder {
  private pipeline: any;

  async init(): Promise<void>
  // Calls pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  // Stores pipeline instance. Idempotent — safe to call multiple times.

  async embed(texts: string[]): Promise<number[][]>
  // Runs feature-extraction on each text, returns 384-dim vectors.
  // Applies mean pooling + L2 normalisation (same as sentence-transformers default).
}
```

Model downloads automatically from HuggingFace Hub on first `init()` call (~22MB, cached at `~/.cache/huggingface/`).
No config required — model ID and cache path are hardcoded in this file.

### Step 10 — Update `projectmap/embedder.ts` — add `local` provider
**File:** `cleanclaw/projectmap/embedder.ts`

After `LocalEmbedder` exists (Step 9), update `getProvider(config)`:
- Import `LocalEmbedder` from `./local-embedder`
- Add `local` as a recognised provider value
- When `provider === 'local'` (or when `config.embeddings` is absent/undefined), return a `LocalEmbedder` instance
- `local` is the default — no config key required to opt in

### Step 11 — Update setup-wizard.ts embedding question to default to `local`
**File:** `cleanclaw/cli/setup-wizard.ts`

Amend the embedding provider question added in Step 6:
- Prompt already reads `(local/openai/ollama-local/vllm-local/http) [local]:`
- When user selects `local` (or presses Enter for default), immediately call `pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')` to trigger the HuggingFace model download during `cleanclaw init`
- Print a status line: `Downloading all-MiniLM-L6-v2 (~22MB)...` before the call, `Done.` after
- This ensures the model is cached before first use — no cold-download on the first `cleanclaw run`

### Step 12 — Create `projectmap/store.ts`
**File:** `cleanclaw/projectmap/store.ts`

TypeScript port of `store.py`. Drops FAISS entirely. Uses:
- JSON files for both vectors and metadata (stored together as `{ rows: [...], vectors: [[...]] }`)
- Flat cosine similarity in plain TypeScript — no external library

Functions to implement (same signatures as Python equivalents):
- `loadTable(storeDir, layer)` — reads `{layer}.json`
- `saveTable(storeDir, layer, rows, vectors)` — writes `{layer}.json`
- `removeFileRows(storeDir, layer, fullPath)` — filters rows by `full_path`
- `queryTable(storeDir, layer, queryVector, topK)` — cosine similarity, returns top-k rows

### Step 13 — Create `projectmap/extractor.ts`
**File:** `cleanclaw/projectmap/extractor.ts`

TypeScript port of `extractor.py`. Direct translation of regex patterns and helper functions:
- `extractMethods(filePath, content)` — same regex patterns per extension
- `isCodeFile(filePath)` — same extension check
- `embedTextForMethod(row)` — same join logic
- `embedTextForMisc(row)` — same join logic

### Step 14 — Create `projectmap/classifier.ts`
**File:** `cleanclaw/projectmap/classifier.ts`

TypeScript port of `classifier.py`. Direct translation:
- Same `_HEURISTICS` keyword sets
- `classifyFile(filePath, layerMap?, extraKeywords?)` — same logic

### Step 15 — Create `projectmap/build.ts`
**File:** `cleanclaw/projectmap/build.ts`

TypeScript port of `build.py`. Direct translation:
- `build(projectRoot, config)` — walks project, classifies, extracts, embeds, saves
- Same `_SKIP_DIRS` and `_MISC_EXTENSIONS` sets
- Calls `getProvider`, `classifyFile`, `extractMethods`, `embedTextForMethod`, `embedTextForMisc`, `saveTable` from the new TS modules

### Step 16 — Create `projectmap/updater-worker.ts`
**File:** `cleanclaw/projectmap/updater-worker.ts`

TypeScript port of `update.py`. Direct translation:
- `update(projectRoot, filePath, config)` — incremental re-index for one file
- Calls the same TS helpers as `build.ts`

### Step 17 — Rewrite `projectmap/updater.ts` to remove shell-out
**File:** `cleanclaw/projectmap/updater.ts`

Currently: `execFileSync('python', ['update.py', ...])`.
Replace with a direct call to `update(projectRoot, filePath, config)` from the new `updater-worker.ts`.
Remove `execFileSync` import. Remove the `SCRIPT` path resolver.

### Step 18 — Rewrite `projectmap/query-bridge.ts` to remove shell-out
**File:** `cleanclaw/projectmap/query-bridge.ts`

Currently: `execFileSync('python', ['query.py', ...])`.
Replace with direct calls to `getProvider` + `queryTable` from the new TS modules.
Remove `execFileSync` import. Remove the `SCRIPT` path resolver.

### Step 19 — Add Vitest tests: classifier and extractor
**File:** `cleanclaw/projectmap/projectmap.test.ts`

Port the classifier and extractor test cases from `test_build.py` into a single Vitest spec file.
Tests to port:
- `classify_file` — 6 test cases
- `extract_methods` — TypeScript function extraction
- `embedTextForMethod` / `embedTextForMisc` — text format checks

### Step 20 — Add Vitest tests: updater
**File:** `cleanclaw/projectmap/updater.test.ts`

Port the updater test cases from `test_update.py` into a Vitest spec file.

### Step 21 — Delete Python files
Delete from `cleanclaw/projectmap/`:
- `embedding.py`
- `store.py`
- `extractor.py`
- `classifier.py`
- `build.py`
- `update.py`
- `query.py`
- `test_build.py`
- `test_update.py`
- `requirements.txt`

### Step 22 — Add cleanclaw install step to root `install.sh`
**File:** `install.sh` (root)

Add a step that runs `npm install -g .` (or equivalent) so the root install script covers cleanclaw without requiring a separate manual step.

### Step 23 — Delete `scripts/cleanclaw-install.sh`
Delete `scripts/cleanclaw-install.sh` (Unix-only, replaced by npm install).

Note: `install.sh` at the root (separate file) — leave untouched unless confirmed redundant.

### Step 24 — Add `cleanclaw/dist/` to `files` array in package.json
**File:** `package.json`

Add `"cleanclaw/dist/"` to the `files` array so compiled CleanClaw output is included when the package is published or installed globally.

---

## Acceptance Criteria
1. `npm install -g .` from source root succeeds on macOS, Linux, and Windows without Python or any shell scripts
2. `cleanclaw init` is the only step needed after install
3. `cleanclaw run <task>` works without Python in PATH
4. `npm test` passes (Vitest — all projectmap tests green)
5. No `.py` files remain in `cleanclaw/projectmap/`
6. `package.json` name is `cleanclaw`
7. `bin/cleanclaw.js` shebang is `#!/usr/bin/env node`
8. When embedding provider is `local` (or unset), `LocalEmbedder` is used — no external embedding API call is made
9. Running `cleanclaw init` with `local` selected downloads and caches `all-MiniLM-L6-v2` before exiting

---

## Files NOT touched
- `nemoclaw/` subdirectory and its package/tsconfig — separate compile unit, leave as-is
- `bin/nemoclaw.js` — not part of this task
- `src/` directory — separate build unit
- Any agent, blueprint, or config schema files
- Planning agent, boss agent, language agents — still use the configured generative LLM (Anthropic/OpenAI), not the local embedder
