# 2026-04-20 — Install Simplification & TypeScript ProjectMap Ports

## Summary

Completed the full removal of Python from CleanClaw. All ProjectMap functionality is now implemented in TypeScript, local embedding works out of the box via `@xenova/transformers`, and the package installs with a single `npm install -g .`.

---

## Changes

### Package rename: nemoclaw → cleanclaw

`package.json` `name` field changed from `nemoclaw` to `cleanclaw`. Description updated to reflect that CleanClaw is a standalone tool, not a NemoClaw sub-mode. The `build:cleanclaw` npm script was added and `prepublishOnly` updated to call it.

### Python projectmap removed

All Python files under `cleanclaw/projectmap/` were deleted:

- `build.py`, `classifier.py`, `embedding.py`, `extractor.py`, `query.py`, `store.py`, `update.py`
- `requirements.txt`
- `test_build.py`, `test_update.py`

These required a Python environment, `sentence-transformers`, and `faiss-cpu` — a significant install burden that blocked first-run experience.

### TypeScript ports added

Direct replacements for every deleted Python module:

| File | Replaces | Role |
|---|---|---|
| `store.ts` | `store.py` | SQLite-backed vector store with cosine similarity query |
| `extractor.ts` | `extractor.py` | AST-based symbol extractor for TS/C#/Svelte/Angular |
| `classifier.ts` | `classifier.py` | Path-heuristic + keyword layer classifier |
| `build.ts` | `build.py` | Full index build pipeline |
| `updater-worker.ts` | `update.py` | Single-file incremental index update |
| `embedder.ts` | `embedding.py` | Provider-agnostic embedding interface (OpenAI, vLLM, Ollama, HTTP, local) |
| `local-embedder.ts` | — | Local embedding via `@xenova/transformers` (all-MiniLM-L6-v2, no API key needed) |

### `@xenova/transformers` added

Added as a production dependency. Enables local embedding without any external API key or Python install. The embedder auto-selects local when no `embeddings` provider is configured — making the tool usable with zero config beyond a project root declaration.

### `query-bridge.ts` and `updater.ts` updated

Both previously shelled out to Python via `execFileSync`. They now call the TypeScript modules directly:

- `query-bridge.ts`: `getProvider()` + `queryTable()` replace the Python subprocess. `queryProjectMap()` is now `async`.
- `updater.ts`: delegates to `updater-worker.ts` `update()`. `triggerProjectMapUpdate()` is now `async`.

### `pipeline.ts` updated

`queryProjectMap()` is now awaited. Row type narrowed via `'method_name' in r` instead of accessing `r.method_name` directly (fixes a type error introduced by the unified `StoreRow` type).

### `setup-wizard.ts` updated

- Added embeddings provider/model/baseUrl prompts during `cleanclaw init`. If the user opts in, the config is written; if not, `embeddings` is omitted entirely.
- `build` step now calls the TypeScript `build()` function rather than `execFileSync('python', ...)`.
- State object now initialises `resumable: false` and `lastCompletedStep: 0` to fix a gap identified in Plan 1.

### `bin/cleanclaw.js` updated

- Shebang changed from `#!/usr/bin/env -S npx tsx` to `#!/usr/bin/env node` — works correctly after `npm install -g .` without requiring `tsx` on the path.
- All dynamic imports now resolve from `dist/` (compiled output) rather than source TypeScript paths.

### `tsconfig.cleanclaw.json` updated

- `outDir` set to `cleanclaw/dist`.
- `exclude` entry added for `cleanclaw/dist` to prevent the compiler from re-processing its own output.

### `config-loader.ts` updated

JSON import updated to use the `with { type: "json" }` assertion form required by NodeNext module resolution.

### 21 Vitest tests added

- `cleanclaw/projectmap/projectmap.test.ts` — covers classifier, extractor, store round-trip, and build pipeline (14 tests).
- `cleanclaw/projectmap/updater.test.ts` — covers incremental update, delete, and no-op cases (7 tests).

### Entry routing (three-path)

CleanClaw `run` entry now distinguishes three states on startup: resume an in-progress task, review a completed task, or start fresh. This was a Plan 1 gap where the pipeline always started fresh.

---

## Why now

The Python dependency was the main friction point for new installs. Every external collaborator had to set up a Python virtualenv, install FAISS, and point the config at the right interpreter before CleanClaw would function. Moving the entire projectmap layer to TypeScript (with a local fallback embedder) reduces install to `npm install -g .` with no other prerequisites.
