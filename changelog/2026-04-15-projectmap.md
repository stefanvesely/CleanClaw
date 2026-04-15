# ProjectMap

**Date:** 2026-04-15
**Branch:** main

## What changed

### Project registry (`cleanclaw/projectmap/project-registry.ts`)

- New module — `readRegistry`, `appendToRegistry`, `getRegistryPath`
- Registry stored at `[project-root]/.cleanclaw/projectmap/registry.json`
- Entry shape: `{ name, path, addedAt }`
- Deduplicates by `path` — silent skip on re-registration
- Directory created on first write (`{ recursive: true }`)

### List command (`cleanclaw/projectmap/list-projects.ts`)

- New module — `listProjects(projectRoot)` prints all registered projects
- Output format: `[name] — [path] (added: [addedAt])`
- Prints `No projects registered yet.` when registry is empty

### CLI command (`bin/cleanclaw.js`)

- New command: `cleanclaw projects` — lists all registered projects for the current project root

### Auto-registration

- `cleanclaw/cli/setup-wizard.ts` — calls `appendToRegistry` after `cleanclaw init` completes
- `cleanclaw/cli/switch-project.ts` — calls `appendToRegistry` on every `cleanclaw switch`, back-fills projects initialised before ProjectMap existed

### FAISS indexing — Python layer (`cleanclaw/projectmap/`)

- `requirements.txt` — `faiss-cpu`, `openai`
- `embedding.py` — pluggable `EmbeddingProvider` ABC with three concrete implementations:
  - `OpenAICompatibleEmbeddingProvider` — handles `openai`, `vllm-local`, `ollama-local` (all speak the OpenAI embeddings API); sensible default base URLs and models per provider
  - `HttpEmbeddingProvider` — zero-dependency stdlib fallback for any OpenAI-shaped endpoint (Cohere, HuggingFace, custom services)
  - `get_provider(config)` reads from `cleanclaw.config.json` — mirrors the existing TS bridge pattern
- `classifier.py` — layer classifier returning `backend | frontend | mediator | misc`
  - Expanded keyword sets covering real-world naming patterns (`dal`, `bll`, `reducers`, `adapters`, `mappers`, `interceptors`, etc.)
  - Config prefix overrides via `layerMap` checked before heuristics
  - Config keyword additions via `layerKeywords` merged at call time
- `extractor.py` — regex method extractor for `.ts`, `.tsx`, `.cs`, `.py`, `.php`
  - Produces rows: `method_name`, `signature`, `output`, `filename`, `full_path`, `metadata`, `algorithm`
  - `embed_text_for_method` and `embed_text_for_misc` centralise what text gets embedded
- `store.py` — FAISS `IndexFlatIP` (cosine similarity via L2-normalised inner product) + JSON sidecar per layer
  - `save_table` — builds and writes index + sidecar
  - `load_table` — reads index + sidecar; returns `(None, [])` when absent
  - `remove_file_rows` — strips stale rows for a file before re-indexing
  - `query_table` — returns top-k metadata rows for a query vector
- `build.py` — full initial scan CLI (`python build.py --root <path> --config <path>`)
  - Walks project tree, skips noise dirs (`.git`, `node_modules`, `dist`, etc.)
  - Classifies each file, extracts methods, collects misc files
  - Embeds each layer in one batch API call
- `update.py` — incremental update CLI (`python update.py --root <path> --file <path>`)
  - Strips stale rows for the changed file across all tables
  - Re-extracts and re-embeds only the changed file
  - Handles deletions cleanly

### TypeScript pipeline integration

- `cleanclaw/projectmap/updater.ts` — `triggerProjectMapUpdate(filePath, projectRoot, config)` shells out to `update.py`; non-fatal (stale index never blocks a code change)
- `cleanclaw/config/config-schema.ts` — added `embeddings?`, `layerMap?`, `layerKeywords?` to `CleanClawConfig`
- `cleanclaw/core/pipeline.ts` — `triggerProjectMapUpdate` called after both `applyChange` sites (per-step and per-file approval paths)
- `cleanclaw/cli/setup-wizard.ts` — prompts to build index immediately after init when `embeddings` is configured

### Storage layout

```
[project-root]/
└── .cleanclaw/
    ├── projectmap/
    │   ├── registry.json       ← project registry (tracked by git)
    │   ├── backend.index       ← FAISS index
    │   ├── backend.json        ← metadata sidecar
    │   ├── frontend.index
    │   ├── frontend.json
    │   ├── mediator.index
    │   ├── mediator.json
    │   ├── misc.index
    │   └── misc.json
    └── plans/                  ← gitignored (task artefacts)
```

### .gitignore

- Added `.cleanclaw/plans/` — task plans are ephemeral, not shared
- `.cleanclaw/projectmap/` intentionally tracked — index travels with the codebase

## Why

Every CleanClaw task previously required a full codebase scan from scratch. ProjectMap builds a persistent semantic index once (on `cleanclaw init`) and updates it incrementally after each applied change. An LLM can query the index at task-start to get general file/method scope without re-scanning the entire repo.
