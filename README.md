# CleanClaw

CleanClaw is an AI-assisted development workflow that runs as a mode of [NemoClaw](https://github.com/NVIDIA/NemoClaw). It adds a human approval step to every AI-proposed code change, enforces a project root boundary so the AI can only touch files you declared in scope, and maintains a permanent audit trail of every decision.

Built on NemoClaw's infrastructure: credential management, inference routing (NVIDIA NIM / vLLM / Anthropic / OpenAI), openshell sandbox, and blueprint profiles.

---

## How it works

1. `nemoclaw create new dev task` — describe what you want to build or fix
2. CleanClaw scans your repo, finds relevant files, and asks four questions to scope the task
3. A planning agent generates a step-by-step plan — you approve before execution starts
4. Each proposed change is shown as a Before/After diff — you approve, reject, or explain
5. The scope guard checks every change against the approved plan. The project root guard hard-blocks any write outside your declared project directory
6. Every decision is logged to `plans/task{N}/task{N}A_log.md` — a permanent audit trail

---

## Prerequisites

- Node.js 22+
- An Anthropic or OpenAI API key (or NVIDIA NIM endpoint)
- [NemoClaw](https://github.com/NVIDIA/NemoClaw) installed

## Install

```bash
git clone https://github.com/stefanvesely/CleanClaw.git
cd CleanClaw
npm install --ignore-scripts
```

## Usage

```bash
nemoclaw create new dev task
```

On first run you will be asked to declare your project root. CleanClaw will not write outside that directory under any circumstances.

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

**API keys:** Set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` as environment variables, or in `~/.cleanclaw/config.json`. Never commit API keys.

## Safety layers

**Project root boundary** — hard block. Any write outside the declared project root is rejected with no override. Not a hint, not a prompt — a wall.

**Scope guard** — per-change check. Before applying each change, the scope guard classifies it against the approved plan using a deterministic pre-check (no LLM, ~60-70% of cases) then an LLM classifier for ambiguous cases. Classifier failure always halts.

**Openshell sandbox** — when openshell is available, CleanClaw reports the active enforcement layers. Kernel-level Landlock filesystem isolation activates once CleanClaw runs inside the openshell container.

## Plan and log format

After a run, `plans/task01/` contains:

**`task01A_plan.md`** — the AI-generated plan broken into numbered steps.  
**`task01A_log.md`** — append-only audit log. Each entry records the file changed, before/after content, your approval reason, and which model proposed the change.  
**`task01A_iter1_plan.md`** — if you triggered a follow-up iteration, each iteration gets its own plan file.

## Approval granularity

- **per-change** — prompted for every individual line change. Most cautious.
- **per-file** — all changes to the same file shown together, one prompt per file. Recommended.
- **per-step** — one prompt per task step regardless of files touched.

## Supported stacks

- **.NET / C#** — idiomatic C#, nullable reference types, async/await
- **Svelte 5** — runes (`$state`, `$derived`, `$effect`), SvelteKit conventions
- **Angular** — signals, standalone components, `inject()`
- **Blazor** — InteractiveServer, `EventCallback`, `IJSRuntime`

Adding a new stack: implement the `LanguageAgent` interface in `cleanclaw/agents/`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
