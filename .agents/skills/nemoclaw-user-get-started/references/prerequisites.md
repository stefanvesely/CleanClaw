<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
# Prerequisites

Before getting started, check the prerequisites to ensure you have the necessary software and hardware to run NemoClaw.

## Hardware

| Resource | Minimum        | Recommended      |
|----------|----------------|------------------|
| CPU      | 4 vCPU         | 4+ vCPU          |
| RAM      | 8 GB           | 16 GB            |
| Disk     | 20 GB free     | 40 GB free       |

The sandbox image is approximately 2.4 GB compressed. During image push, the Docker daemon, k3s, and the OpenShell gateway run alongside the export pipeline. The pipeline buffers decompressed layers in memory. On machines with less than 8 GB of RAM, this combined usage can trigger the OOM killer. If you cannot add memory, configuring at least 8 GB of swap can work around the issue at the cost of slower performance.

## Software

| Dependency | Version                          |
|------------|----------------------------------|
| Node.js    | 22.16 or later |
| npm        | 10 or later |
| Platform   | See [Platforms](#platforms) below |

:::{warning} OpenShell Lifecycle
For NemoClaw-managed environments, use `nemoclaw onboard` when you need to create or recreate the OpenShell gateway or sandbox.
Avoid `openshell self-update`, `npm update -g openshell`, `openshell gateway start --recreate`, or `openshell sandbox create` directly unless you intend to manage OpenShell separately and then rerun `nemoclaw onboard`.
:::

:::{note} Docker storage driver
On Linux hosts running Docker 26 or later with the [containerd image store](https://docs.docker.com/engine/storage/containerd/) enabled (the install-time default for fresh `docker-ce` installations on Ubuntu 24.04 and similar distros), `nemoclaw onboard` transparently builds a `fuse-overlayfs`-enabled cluster image to bypass a kernel-level nested-overlay limitation in k3s.
No manual setup is required.
See the troubleshooting guide (use the `nemoclaw-user-reference` skill) for the override knobs and a manual `daemon.json` alternative.
:::

## Platforms

The following table lists tested platform and runtime combinations.
Availability is not limited to these entries, but untested configurations can have issues.
The table is generated from [`ci/platform-matrix.json`](https://github.com/NVIDIA/NemoClaw/blob/main/ci/platform-matrix.json), the single source of truth kept in sync by CI and QA.

# CleanClaw

> **Status: Initial setup ready for testing.**
> The core workflow, provider parity, and Python-free install are complete.
> The following steps are still needed to fully align with NemoClaw:
>
> - **Credentials** — CleanClaw reads env vars only; needs fallback to NemoClaw's `~/.nemoclaw/credentials.json` registry, and `createDevTask()` must export credentials before calling CleanClaw
> - **Logging** — Replace `console.log` with a structured logger that integrates with OpenClaw's log aggregator when running inside NemoClaw
> - **Secret scanner** — Scan plan/log files for secrets before writing to disk
> - **Gateway routing** — Route inference through `inference.local/v1` when running inside NemoClaw context (detected via `NEMOCLAW_SESSION_ID`)
> - **Session context** — Pass blueprint profile and session/auth context from NemoClaw to CleanClaw
> - **Sandbox (Phase 8)** — Move CleanClaw into the OpenShell container and enable Landlock enforcement

---

CleanClaw is an AI-assisted development workflow. It adds a human approval step to every AI-proposed code change, enforces a project root boundary so the AI can only touch files you declared in scope, and maintains a permanent audit trail of every decision.

Inference routing supports Anthropic, OpenAI, NVIDIA NIM, and vLLM. ProjectMap builds a semantic index of your codebase — local embedding works out of the box with no API key required.

---

## How it works

1. `cleanclaw init` — declare your project root and configure inference. ProjectMap index is built automatically (embedding provider auto-detected; local model used if no API key is set)
2. `cleanclaw run "your task"` — describe what you want to build or fix
3. CleanClaw scans your repo, finds relevant files, and asks four questions to scope the task
4. A planning agent generates a step-by-step plan — you approve before execution starts
5. Each proposed change is shown as a Before/After diff — you approve, reject, or explain
6. The scope guard checks every change against the approved plan. The project root guard hard-blocks any write outside your declared project directory
7. Every decision is logged to `plans/task{N}/task{N}A_log.md` — a permanent audit trail

---

## Prerequisites

- Node.js 22+
- An Anthropic or OpenAI API key — or nothing, if you use the built-in local embedding model

## Install

```bash
git clone https://github.com/stefanvesely/CleanClaw.git
cd CleanClaw
npm install -g .
```

## Usage

```bash
# Set up a project (run once per repo)
cleanclaw init

# Start a task
cleanclaw run "your task description"
```

`cleanclaw init` walks you through declaring your project root, choosing your inference provider, and optionally configuring the ProjectMap embedding provider. If you skip the embedding provider prompt, local embedding via `all-MiniLM-L6-v2` is used automatically — no API key required.

CleanClaw will not write outside the declared project root under any circumstances.

## Config reference (`cleanclaw.config.json`)

| Field | Default | Description |
|---|---|---|
| `projectName` | required | Your project name |
| `provider` | `anthropic` | `anthropic` or `openai` |
| `approvalGranularity` | `per-file` | `per-change`, `per-file`, or `per-step` |
| `stack` | `dotnet` | `dotnet`, `svelte`, `angular`, or `blazor` |
| `plansDir` | `./plans` | Where plans and logs are written |
| `logFormat` | `markdown` | `markdown` or `json` |
| `projectRoots` | `[]` | Declared project roots — set on first run, persisted globally |
| `enableWizardDelegation` | `false` | When true, LLM pre-populates task scoping questions |
| `embeddings` | — | ProjectMap embedding config (see below) |
| `layerMap` | — | Path prefix overrides for layer classification e.g. `{ "src/Shared": "backend" }` |
| `layerKeywords` | — | Extra keywords per layer e.g. `{ "backend": ["myservice"] }` |

**API keys:** Set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` as environment variables, or in `~/.cleanclaw/config.json`. Never commit API keys.

## ProjectMap

ProjectMap builds a persistent semantic index of your codebase so CleanClaw can reason about project structure at task-start without re-scanning from scratch every time.

### Setup

No Python required. Run `cleanclaw init` — it will ask whether to enable embeddings and offer to build the index immediately.

To enable embeddings manually, add an `embeddings` block to `cleanclaw.config.json`:

```json
"embeddings": {
  "provider": "openai",
  "model": "text-embedding-3-small"
}
```

Supported providers: `openai`, `vllm-local`, `ollama-local`, `http` (any OpenAI-shaped endpoint), and `local` (built-in `all-MiniLM-L6-v2` via `@xenova/transformers` — no API key needed).

If no `embeddings` block is present, the local model is used automatically.

### Build the index

`cleanclaw init` offers to build it on first run. To rebuild manually, there is currently no standalone CLI command — re-run `cleanclaw init` and choose to rebuild when prompted.

### What gets indexed

Four tables, stored in `.cleanclaw/projectmap/` inside the project repo (tracked by git, travels with the codebase):

| Table | Content | Columns |
|---|---|---|
| `backend` | API controllers, services, repositories | `method_name`, `signature`, `output`, `filename`, `full_path`, `metadata`, `algorithm` |
| `frontend` | Components, hooks, store actions | same |
| `mediator` | Gateways, middleware, mappers | same |
| `misc` | Config, templates, assets | `filename`, `purpose`, `related_layer` |

Layer classification uses path-segment heuristics and is overridable via `layerMap` and `layerKeywords` in config.

### Commands

```bash
cleanclaw projects        # list all registered projects
```

The index updates automatically after each applied change when `embeddings` is configured. Manual single-file updates are handled internally by the pipeline — there is no separate CLI command for incremental updates.

## Safety layers

**Project root boundary** — hard block. Any write outside the declared project root is rejected with no override. Not a hint, not a prompt — a wall.

**Scope guard** — per-change check. Before applying each change, the scope guard classifies it against the approved plan using a deterministic pre-check (no LLM, ~60-70% of cases) then an LLM classifier for ambiguous cases. Classifier failure always halts.

**Openshell sandbox** — when openshell is available, CleanClaw reports the active enforcement layers. Kernel-level Landlock filesystem isolation activates once CleanClaw runs inside the openshell container.

## Plan and log format

After a run, `plans/task01/` contains:

- **`task01A_plan.md`** — the AI-generated plan broken into numbered steps.
- **`task01A_log.md`** — append-only audit log. Each entry records the file changed, before/after content, your approval reason, and which model proposed the change.
- **`task01A_iter1_plan.md`** — if you triggered a follow-up iteration, each iteration gets its own plan file.

## Approval granularity

- **per-change** — prompted for every individual line change. Most cautious.
- **per-file** — all changes to the same file shown together, one prompt per file. Recommended.
- **per-step** — one prompt per task step regardless of files touched.

## Headless / CI mode

Run CleanClaw in a CI pipeline without any interactive prompts:

```bash
cleanclaw run "your task description" --headless
```

In headless mode:

- All proposed changes are auto-approved — no stdin required.
- Any scope violation (`halt-confirm` decision) prints to stderr and exits with code `1`, failing the pipeline.
- Resume prompts and plan-review confirmations are skipped.

> **Warning:** Headless mode applies every agent-proposed change without human review. Only use it for low-risk automated tasks (doc generation, formatting, test scaffolding) where the change surface is well-understood. Never run headless on production branches without a review gate downstream.

## Supported stacks

- **.NET / C#** — idiomatic C#, nullable reference types, async/await
- **Svelte 5** — runes (`$state`, `$derived`, `$effect`), SvelteKit conventions
- **Angular** — signals, standalone components, `inject()`
- **Blazor** — InteractiveServer, `EventCallback`, `IJSRuntime`

Adding a new stack: implement the `LanguageAgent` interface in `cleanclaw/agents/`.

## Contributing

See [CONTRIBUTING.md](https://docs.nvidia.com/nemoclaw/latest/get-started/CONTRIBUTING.html).

## Next Steps

- Prepare Windows for NemoClaw (use the `nemoclaw-user-get-started` skill) if you are using Windows.
- Quickstart (use the `nemoclaw-user-get-started` skill) to install NemoClaw and launch your first sandbox.
