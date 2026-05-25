# CleanClaw

> **NOTE: CleanClaw is a first test project.**
> Please log improvement tickets before treating it as production-ready. The current code is intended for setup validation, local workflow testing, and guided iteration on the CleanClaw/NemoClaw integration.

## Planned Next Steps

CleanClaw is being rebuilt into its own controlled coding agent with NemoClaw/OpenShell as the backing guardrail/runtime layer. The active plan is tracked in `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`.

1. **Control contract and state machine** — enforce task states, approved why, granular approvals, file scope, command approval, frontier-model approval, commit approval, push approval, and project-local records before expanding agent behavior.
2. **Project root and visible scope tree** — attach CleanClaw to an explicit project root, show planned reads/edits/new files/validation commands/out-of-root requests, and store the same scope in task state.
3. **Planning-first project loop** — make `cleanclaw` start an interactive project-agent session that can answer project questions, create plans, execute approved plans, and return to planning after each task.
4. **Numbered menus for non-engineers** — use numbered choices for setup, approvals, runtime decisions, validation, and headless preparation while still accepting natural language.
5. **Stack inference, ProjectMap, and stack agents** — infer the stack from project files and ProjectMap, add broad specialist-agent coverage, reuse the per-project vector DB when fresh, and update changed/new/deleted files after tasks.
6. **Project-local memory** — store plans, completed plans, changelogs, task logs, validation records, approval records, settings, runtime state, and ProjectMap/vector files under `.cleanclaw/` in each project repo.
7. **ProjectMap storage policy** — treat `.cleanclaw/projectmap/` as commit-eligible project memory up to a 50 MB warning threshold; above that, ask whether to commit anyway, keep local/ignored, compact/rebuild, or exclude folders.
8. **Local-first model routing** — use local embeddings by default, prefer NemoClaw-backed Ollama/vLLM for local chat/coding runtime, and ask before escalating to frontier models.
9. **Headless safety** — allow headless execution only from approved plans with approved why, scope, validation, stop conditions, storage policy, and coder/reviewer model roles; warn and record risk if the same model is used for both roles.
10. **NemoClaw runtime setup** — during setup and startup, check whether NemoClaw/OpenShell is available and running, ask before starting it unless configured otherwise, and never silently degrade sandbox/runtime protection.
11. **Controlled execution workflow** — default to per-change approval, ask before each validation command, update ProjectMap and changelog after completion, and return to planning mode by default. Broader approval modes are saved only when the user explicitly asks for them per project.
12. **Release gate and smoke tests** — require build/tests, setup smoke, planning smoke, controlled execution smoke, ProjectMap update smoke, NemoClaw runtime check smoke, README review, changelog review, and plan-record review before release.

## Current Implementation Status

The active rebuild is now a working CleanClaw coding-agent foundation. It is still a test project, but the core workflow pieces are in place: project attachment, planning-first interaction, visible scope, project-local records, stack inference, ProjectMap freshness/storage policy, local-first model routing policy, NemoClaw/OpenShell runtime prompts, reviewer gates, headless guardrails, and conservative per-change approval defaults.

Implemented so far:

- `cleanclaw/core/control-contract.ts` defines the Phase 0 lifecycle states, approved why checks, file/read/command/frontier/commit/push guards, approval records, and why-alignment records.
- `cleanclaw/core/task-records.ts` persists project-local task records under `.cleanclaw/tasks/<task-id>/`.
- `cleanclaw/core/scope-tree.ts` persists visible scope trees with root directory, planned reads, planned edits, planned new files, validation commands, and out-of-root requests.
- `runPipeline` now writes `.cleanclaw/tasks/task<id>/state.json`, records approved task why when available, and writes `.cleanclaw/tasks/task<id>/scope-tree.json` at task startup.
- `runPipeline` renders the workspace scope tree before execution and pauses when execution tries to expand planned file scope.
- `cleanclaw status` now resolves the active project from the current project folder before falling back to the global pointer, then shows legacy state, project-local settings, approval mode, and latest task-record details.
- `cleanclaw status` also reports active root, config path, ProjectMap state, runtime mode, and guardrail/sandbox status.
- Project-local `.cleanclaw/settings.json` helpers are in place and setup/switch/status are wired to create or display those settings.
- Config loading now reads `cleanclaw.config.json` from the resolved project root instead of whichever shell directory imported the module.
- Pipeline plan/log directories, resumable state loading, and rollback log lookup now resolve from the active project root.
- Pipeline file proposals now resolve relative paths against the active project root before filesystem checks or writes, and per-file execution applies the root guard before changes land.
- Scope trees now include lifecycle metadata for why approval, pre-edit checks, validation planning, applied changes, and completion.
- Broad project file scans now require interactive approval, are announced with a reason, and are recorded under `.cleanclaw/scan-approval-records.json`; headless mode fails closed.
- `cleanclaw attach <path>` attaches a repo, detects project markers, stores project-local settings, and updates the active project pointer.
- Interactive `cleanclaw` sessions can confirm the project, discover in-progress plans, create or continue plans, answer project questions, and return to planning after task completion.
- Stack inference covers common frontend, backend, mobile, Docker, and CI markers; stack selection can be confirmed or overridden and persisted.
- ProjectMap stores project-local registry/vector data under `.cleanclaw/projectmap/`, tracks freshness, warns at the 50 MB storage threshold, and updates incrementally after task changes.
- Numbered menus are available for major choices while advanced users can still type ids or natural language where appropriate.
- Model routing is role-based: planner, coder, reviewer, local coder, and embedding roles are explicit; local-only mode blocks frontier routes.
- Local chat/coding provider abstraction exists for `ollama-local` and `vllm-local`; runtime lifecycle policy starts local runtime only during CleanClaw sessions unless configured otherwise.
- NemoClaw/OpenShell setup/startup prompts ask before install/configure, start, standalone fallback, runtime settings, or stop.
- Sandbox fallback prompts ask before continuing on the host when sandbox execution was expected.
- Reviewer gates and high-risk reviewer prompts exist before execution, risky/scope-changing edits, and headless completion.
- Headless execution is allowed only from approved granular plans with model roles, why, scope, validation, stop conditions, and storage policy.
- Focused tests cover the control contract, task records, scope trees, project settings, active project resolution, root guard, route changes, numbered prompts, stack inference, ProjectMap freshness/storage, local model policy, runtime prompts, reviewer gates, and headless safety policies.

Still planned:

- Run and document the full smoke suite: fresh setup, planning-only task, controlled execution task, scope expansion, headless rejection, and NemoClaw degraded runtime.
- Close the final release acceptance checklist once smoke validation passes.
- Keep normalized approval events as a later enterprise-gateway enhancement.

CleanClaw is a coding-agent workflow layer for AI-assisted development. It is designed to sit between a developer and an implementation agent: it asks for project context, builds a scoped plan, routes work through provider and sandbox policy, requires human approval before changes land, and leaves a permanent audit trail of plans, decisions, diffs, and rollback metadata.

CleanClaw is being aligned with NemoClaw so it can run as a first-class project workflow inside the OpenShell/NemoClaw environment while still working as a standalone local tool. Current integration work includes NemoClaw provider parity, gateway routing, credential handoff, structured logging, secret redaction, runtime context handoff, and sandbox-aware execution.

The next major milestone is smoke validation: prove that a non-engineer can install CleanClaw, attach it to a project, infer stack, build or reuse ProjectMap, plan first, execute a controlled task with granular approval, return to planning, refuse unsafe headless mode, and see NemoClaw runtime status clearly.

> **Current testing note.**
> Provider parity, credential fallback, structured logging, secret redaction, gateway routing, runtime context handoff, sandbox-aware execution helpers, and NemoClaw/OpenShell prompt policies are implemented as code-level foundations. Full live smoke validation still depends on the user's local credentials, local runtime, and OpenShell/NemoClaw availability.

---

CleanClaw is an AI-assisted development workflow. It adds a human approval step to every AI-proposed code change, enforces a project root boundary so the AI can only touch files you declared in scope, and maintains a permanent audit trail of every decision.

Inference routing supports Anthropic, OpenAI, NVIDIA NIM, and vLLM. ProjectMap builds a semantic index of your codebase — local embedding works out of the box with no API key required.

---

## How it works

1. `cleanclaw attach <path>` or `cleanclaw init` declares the project root and stores project-local settings.
2. `cleanclaw` starts the interactive project session; it confirms the project, asks what task you want to do, and discovers whether to continue an in-progress plan or create a new one.
3. CleanClaw asks why the work matters, builds a visible scope tree, detects the stack, and uses ProjectMap when it is fresh.
4. A planning-first loop creates an approved plan before execution. Planning itself is never headless.
5. During execution, each proposed change is checked against why, scope, route, model, approval, command, and root-guard policy.
6. Granular approval defaults to `per-change`; broader modes are saved only when explicitly requested for that project.
7. Task records, plan files, approval records, validation records, changelogs, and ProjectMap updates live under the project-local `.cleanclaw/` folder.

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

# Attach an existing project explicitly
cleanclaw attach .

# Start or continue an interactive project session
cleanclaw

# Run a specific task directly when needed
cleanclaw run "your task description"
```

`cleanclaw init` walks you through declaring your project root, choosing your inference provider, and configuring ProjectMap. Local embedding is the default when no embedding provider is specified. Runtime prompts ask before starting NemoClaw/OpenShell, continuing standalone, changing settings, or stopping.

CleanClaw will not write outside the declared project root under any circumstances.

## Config reference (`cleanclaw.config.json`)

| Field | Default | Description |
|---|---|---|
| `projectName` | required | Your project name |
| `provider` | `nvidia-nim` | Supported provider id, including NVIDIA, OpenAI, Anthropic, compatible endpoints, `ollama-local`, or `vllm-local` |
| `approvalGranularity` | `per-change` | `per-change`, `per-file`, or `per-step` |
| `stack` | inferred | Inferred or selected stack, including common frontend, backend, mobile, Docker, and CI stacks |
| `plansDir` | `./plans` | Where plans and logs are written |
| `logFormat` | `markdown` | `markdown` or `json` |
| `projectRoots` | `[]` | Declared project roots; project-local `.cleanclaw/settings.json` is preferred for active project work |
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
cleanclaw attach <path>   # attach CleanClaw to a project directory and save project-local settings
cleanclaw projects        # list all registered projects
```

`cleanclaw attach <path>` is the first non-interactive root attachment command. It resolves absolute paths, relative paths, `.`, and `~`, validates that the selected path exists, is a directory, and is writable, writes `.cleanclaw/settings.json`, sets the active-project pointer, and prints detected project markers such as `.git`, `package.json`, `cleanclaw.config.json`, `pyproject.toml`, solution/project files, lockfiles, and common framework config files.

The index updates automatically after each applied change when `embeddings` is configured. Manual single-file updates are handled internally by the pipeline — there is no separate CLI command for incremental updates.

## Safety layers

**Project root boundary** — hard block. Any write outside the declared project root is rejected with no override. Not a hint, not a prompt — a wall.

**Scope guard** — per-change check. Before applying each change, the scope guard classifies it against the approved plan using a deterministic pre-check (no LLM, ~60-70% of cases) then an LLM classifier for ambiguous cases. Classifier failure always halts.

**Openshell sandbox** — when openshell is available, CleanClaw reports the active enforcement layers. Kernel-level Landlock filesystem isolation activates once CleanClaw runs inside the openshell container.

## Plan and log format

After a run, the legacy plan directory still contains:

- **`task01A_plan.md`** — the AI-generated plan broken into numbered steps.
- **`task01A_log.md`** — append-only audit log. Each entry records the file changed, before/after content, your approval reason, and which model proposed the change.
- **`task01A_iter1_plan.md`** — if you triggered a follow-up iteration, each iteration gets its own plan file.

The new project-local control records are written under:

```text
.cleanclaw/
  tasks/
    task01/
      state.json
      approval-records.json
      why-alignment-records.json
      scope-tree.json
```

`state.json` records the active lifecycle state, task why, approved files, approved commands, approval mode, and model policy. `scope-tree.json` records the visible workspace scope that CleanClaw is using for the task.

## Approval granularity

- **per-change** — prompted for every individual line change. Most cautious.
- **per-file** — all changes to the same file shown together, one prompt per file.
- **per-step** — one prompt per task step regardless of files touched.

CleanClaw's planned default is always the most granular mode, `per-change`. Broader approval modes should be saved only when the user explicitly asks for that project preference.

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

See [CONTRIBUTING.md](CONTRIBUTING.md).
