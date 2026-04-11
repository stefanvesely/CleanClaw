# CleanClaw

> **Proof of Concept — Pre-NemoClaw Full Merge**
>
> CleanClaw in its current form is a standalone proof of concept for the human-approval audit layer. It deliberately bypasses the full NemoClaw infrastructure (inference routing, sandbox execution, credential management, blueprint profiles, policy enforcement) to validate the core approval workflow in isolation.
>
> The next phase integrates CleanClaw directly into NemoClaw — using NemoClaw's credential management, inference routing via NVIDIA NIM/vLLM, sandbox execution, and blueprint profiles as the foundation. This README describes the current PoC only.

---

CleanClaw is a command-line tool that adds a human approval step to AI-assisted code changes. Every change proposed by an AI is shown to you as a Before/After diff. When you approve, the change and your reasoning are logged to a markdown file in your project — a permanent, auditable record of every AI-assisted decision.

## Prerequisites

- Node.js 22+
- An Anthropic or OpenAI API key

## Install

```bash
git clone https://github.com/stefanvesely/CleanClaw.git
cd CleanClaw
bash scripts/cleanclaw-install.sh
```

## First run

```bash
cleanclaw init          # wizard: provider, API key, stack
cleanclaw run "Add input validation to the login function"
cat plans/task01/task01A_log.md
```

## Config reference

| Field | Default | Description |
|---|---|---|
| `projectName` | required | Your project name |
| `provider` | `anthropic` | `anthropic` or `openai` |
| `approvalGranularity` | `per-file` | `per-change`, `per-file`, or `per-step` |
| `stack` | `dotnet` | `dotnet`, `svelte`, `angular`, or `blazor` |
| `plansDir` | `./plans` | Where plans and logs are written |
| `logFormat` | `markdown` | `markdown` or `json` |

**API keys:** Set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` as environment variables, or place them in `~/.cleanclaw/config.json`. Never put API keys in `cleanclaw.config.json`.

## Approval granularity

- **per-change** — prompted for every individual line change. Most cautious, highest friction.
- **per-file** — all changes to the same file shown together, one approval prompt per file. Recommended default.
- **per-step** — prompted once per task step regardless of how many files are touched.

## Plan and log format

After a run, `plans/task01/` contains:

**`task01A_plan.md`** — the AI-generated plan broken into numbered steps.

**`task01A_log.md`** — an append-only audit log. Each entry records:
- File changed
- Before and after content
- Why it was approved (your words or the agent's explanation)
- Which model proposed the change

## Supported stacks

- **.NET / C#** — idiomatic C#, nullable reference types, async/await
- **Svelte 5** — runes (`$state`, `$derived`, `$effect`), SvelteKit conventions
- **Angular** — signals, standalone components, `inject()`
- **Blazor** — InteractiveServer, `EventCallback`, `IJSRuntime`

Adding a new language is one file: implement the `LanguageAgent` interface in `cleanclaw/agents/`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
