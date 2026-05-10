# CleanClaw Phase 1 — Detailed Weekend Build Plan

**Date:** 2026-04-02  
**Developer:** Stefan Vesely (sole)  
**Timeline:** 7 weekends  
**Goal:** Working open-source tool launched on GitHub, evidence collected for seed raise

---

## Architecture Decision (Read This First)

After reading the NemoClaw source, there is a critical architecture clarification needed before Weekend 1.

**NemoClaw is not a general-purpose AI orchestration layer.** It is a Docker/Linux sandbox wrapper for OpenClaw agents, using the OpenShell runtime and NVIDIA inference endpoints. Its plugin API (`OpenClawPluginApi`) is designed specifically for OpenClaw's sandboxed agent model — not for general LLM workflow orchestration.

**CleanClaw does not need to run inside NemoClaw's sandbox.** What CleanClaw needs from NemoClaw is:

1. The TypeScript project structure and tooling (tsconfig, eslint, vitest, ESM modules) — already done
2. The concept of a "plugin registration" pattern — useful to adopt for CleanClaw's own agent registration
3. The existing `src/lib/` files are NemoClaw infrastructure and should be left untouched

**Decision:** CleanClaw lives as a top-level `cleanclaw/` directory in the repo. NemoClaw's `src/` tree is not touched at all. The CleanClaw binary will be a separate entry point from `nemoclaw.js`.

The folder structure:
```
cleanclaw/
  core/
    pipeline.ts
    boss-agent.ts
    planning-agent.ts
    language-agent.ts
    verification-layer.ts
    state-manager.ts
    config-loader.ts
    config-merger.ts
    agent-router.ts
  plans/
    plan-writer.ts
    log-writer.ts
    diff-capture.ts
    variant-manager.ts
  bridges/
    anthropic-bridge.ts
    openai-bridge.ts
  agents/
    dotnet-agent.ts
    svelte-agent.ts
    angular-agent.ts
    blazor-agent.ts
    (additional language agents added here — one file per language)
  cli/
    run-workflow.ts
    setup-wizard.ts
  config/
    default-config.json
    config-schema.ts
bin/
  cleanclaw.js   (new CLI entry point, separate from nemoclaw.js)
```

### Language Agent Architecture

CleanClaw supports any programming language/stack via language agents. Each agent is a separate file in `cleanclaw/agents/`. The architecture must make adding a new language trivial — a new agent is a new file implementing a shared `LanguageAgent` interface. No changes to core files required.

**Phase 1 proof-of-concept agents:** `.NET`, `Svelte`, `Angular`, `Blazor`

All other languages are supported architecturally from day one — they just don't have agent files yet. The `agent-router.ts` resolves the correct agent from config using the stack name as a key.

---

## Pre-Weekend-1 Checklist (Do Before Weekend 1 Starts)

These are setup tasks. Complete them before Weekend 1 begins.

### WSL2 + Docker Desktop Setup

Stefan is completing this setup this weekend. Steps for reference:

1. Enable WSL2 in Windows Features (`wsl --install` from PowerShell as admin)
2. Install Ubuntu 22.04 LTS from Microsoft Store
3. Install Docker Desktop for Windows (WSL2 backend)
4. Verify: `docker run hello-world` inside WSL2 terminal passes
5. Verify: `node --version` shows 22.x inside WSL2
6. Verify: `npm install` completes in the repo root inside WSL2

**Expected time:** 1-2 hours on a good connection

### Fork Preparation

1. Create a new GitHub repository: `cleanclaw` (public, this is the open-source product)
2. The existing CleanClaw folder at `C:/Users/StefanVesely/source/repos/Work/CleanClaw/` becomes the working directory
3. Update `package.json`: change `name` from `"nemoclaw"` to `"cleanclaw"`, update `description`, update `repository.url`
4. Add a `bin/cleanclaw.js` stub (empty for now) alongside `bin/nemoclaw.js`
5. Commit and push — this is the foundation commit

---

## Weekend 1 — Foundation and Bridge Proof of Concept

**Time estimate:** 8-12 hours

**Goal:** Prove CleanClaw can make an LLM API call through its own bridge layer, end to end, in the TypeScript environment.

**Why this order:** The entire product depends on LLM calls working. Validate this on Day 1 before building anything on top of it. Do not start building pipeline abstractions until you have proof the foundation works.

### Tasks

**Task 1.1 — Project structure scaffolding**

Create the directory structure. No logic yet, just empty files with placeholder exports.

Files to create:
```
cleanclaw/core/pipeline.ts
cleanclaw/core/boss-agent.ts
cleanclaw/core/planning-agent.ts
cleanclaw/core/language-agent.ts
cleanclaw/core/verification-layer.ts
cleanclaw/core/state-manager.ts
cleanclaw/core/config-loader.ts
cleanclaw/core/config-merger.ts
cleanclaw/core/agent-router.ts
cleanclaw/plans/plan-writer.ts
cleanclaw/plans/log-writer.ts
cleanclaw/plans/diff-capture.ts
cleanclaw/plans/variant-manager.ts
cleanclaw/bridges/anthropic-bridge.ts
cleanclaw/bridges/openai-bridge.ts
cleanclaw/agents/dotnet-agent.ts
cleanclaw/agents/svelte-agent.ts
cleanclaw/agents/angular-agent.ts
cleanclaw/agents/blazor-agent.ts
cleanclaw/cli/run-workflow.ts
cleanclaw/cli/setup-wizard.ts
cleanclaw/config/default-config.json
cleanclaw/config/config-schema.ts
```

**Task 1.2 — Install LLM SDKs**

```bash
npm install @anthropic-ai/sdk openai
```

Verify both can be imported in a test file. Note the SDK versions used — pin them in `package.json`.

**Task 1.3 — Config schema and loader**

File: `cleanclaw/config/config-schema.ts`

Define the TypeScript interface for the CleanClaw config:
```typescript
export interface CleanClawConfig {
  provider: 'anthropic' | 'openai';
  anthropic?: { apiKey: string; model: string };
  openai?: { apiKey: string; model: string };
  approvalGranularity: 'per-step' | 'per-file' | 'per-change';
  projectName: string;
  plansDir: string;
  stack: string;  // e.g. 'dotnet', 'svelte', 'angular', 'blazor', 'react', 'python', etc.
}
```

The `stack` field is the key used by `agent-router.ts` to look up the correct language agent. It is a free-form string — any value is valid as long as a matching agent file exists in `cleanclaw/agents/`. This design means adding a new language is: create `cleanclaw/agents/python-agent.ts`, set `stack: "python"` in config. Nothing else changes.

File: `cleanclaw/config/default-config.json`

```json
{
  "provider": "anthropic",
  "approvalGranularity": "per-file",
  "plansDir": "./plans",
  "stack": "dotnet"
}
```

File: `cleanclaw/core/config-loader.ts`

Reads `cleanclaw.config.json` from the project root. Merges with defaults. Throws a clear error if required fields (apiKey) are missing. No validation library — plain TypeScript type narrowing.

**Task 1.4 — Anthropic bridge (first working bridge)**

File: `cleanclaw/bridges/anthropic-bridge.ts`

Wrap the Anthropic SDK in a simple interface:
```typescript
export interface BridgeMessage { role: 'user' | 'assistant'; content: string }
export interface BridgeResponse { content: string; model: string; usage: { inputTokens: number; outputTokens: number } }
export interface Bridge {
  send(messages: BridgeMessage[], systemPrompt?: string): Promise<BridgeResponse>
}
```

Implement `AnthropicBridge` using `@anthropic-ai/sdk`. No streaming in Phase 1 — simple request/response only.

**Task 1.5 — Manual end-to-end smoke test**

Write a throwaway test script (not committed to main, or committed to `test/smoke/`):
- Load config from `cleanclaw.config.json`
- Create an `AnthropicBridge`
- Send "Hello, respond with the word WORKING" as a message
- Print the response to stdout

Run it. It must print WORKING. This is the Weekend 1 milestone.

**Milestone:** `AnthropicBridge` returns a live response from Anthropic API through config-loaded credentials.

### Files Created This Weekend
- `cleanclaw/` — full directory tree scaffolded
- `cleanclaw/bridges/anthropic-bridge.ts` — working
- `cleanclaw/core/config-loader.ts` — working
- `cleanclaw/config/config-schema.ts` — complete (includes `stack` field)
- `cleanclaw/config/default-config.json` — complete

### Risk This Weekend
- Anthropic SDK import issues with ESM modules. The existing NemoClaw code uses `"type": "module"` — the Anthropic SDK supports this but needs explicit `.js` extensions in imports.

---

## Weekend 2 — Core Pipeline and Boss/Planning Agents

**Time estimate:** 10-14 hours

**Goal:** Boss agent orchestrates a task, delegates to planning agent, produces a plan file on disk.

**Why this order:** The plan file is the product's most visible output. Getting it working early means every subsequent weekend produces real artefacts you can demo.

### Tasks

**Task 2.1 — OpenAI bridge**

File: `cleanclaw/bridges/openai-bridge.ts`

Implement `OpenAiBridge` using the `openai` SDK, same `Bridge` interface as `AnthropicBridge`. Same approach: no streaming, simple request/response.

**Task 2.2 — Agent router**

File: `cleanclaw/core/agent-router.ts`

Reads `config.provider` and returns the correct bridge instance. Reads `config.stack` and returns the correct language agent. Simple lookups — no abstraction beyond that. Takes config, returns a `Bridge` and a `LanguageAgent`.

Adding a new language: add the agent file to `cleanclaw/agents/`, register it in the router's agent map. That is the entire extension point.

**Task 2.3 — Planning agent**

File: `cleanclaw/core/planning-agent.ts`

The planning agent receives a task description and produces a structured markdown plan. It calls the bridge with a system prompt that specifies the exact plan file format:

```
# TaskXXA

## Objective
...

## Steps
1. Step — file(s) expected to change
2. Step — file(s) expected to change

## Scope Boundary
...
```

The planning agent's output is the raw markdown string. It does not write the file — that is the plan writer's job.

**Task 2.4 — Plan writer**

File: `cleanclaw/plans/plan-writer.ts`

Takes a task ID, variant letter, and markdown string. Writes to `{plansDir}/task{id}/task{id}{variant}_plan.md`. Creates directories if they don't exist. The plan file is never overwritten after creation — if it already exists, throw. This enforces the "record of intent" guarantee.

**Task 2.5 — Boss agent**

File: `cleanclaw/core/boss-agent.ts`

The boss agent is the entry point for a task. It:
1. Accepts a task description from the user (passed as a string for now — CLI comes in Weekend 6)
2. Assigns a task ID and variant (starts at A)
3. Calls the planning agent to get a plan
4. Calls the plan writer to save it
5. Returns the plan file path and the plan content

**Task 2.6 — Pipeline (thin orchestration layer)**

File: `cleanclaw/core/pipeline.ts`

The pipeline holds the sequence: boss → planner → (later) language agent → verification. For now it just wires boss and planner. This is not a complex abstraction — it is a plain function that calls agents in order and passes state between them.

**Task 2.7 — Smoke test Weekend 2**

Hard-code a task description ("Add a TypeScript function that returns the sum of two numbers"). Run the pipeline. Confirm the plan file appears at `./plans/task01/task01A_plan.md` with correct content.

**Milestone:** Boss routes to planning agent, plan file produced and saved to disk with correct format.

### Files Created This Weekend
- `cleanclaw/bridges/openai-bridge.ts`
- `cleanclaw/core/agent-router.ts`
- `cleanclaw/core/planning-agent.ts`
- `cleanclaw/core/boss-agent.ts`
- `cleanclaw/core/pipeline.ts`
- `cleanclaw/plans/plan-writer.ts`

### Risk This Weekend
- Planning agent output not reliably matching the expected format. Mitigation: use a strict system prompt with a literal example of the format. Add a validation step in plan-writer that checks the markdown has the required headings before writing.

---

## Weekend 3 — Language Agent and Approval Handler

**Time estimate:** 10-14 hours

**Goal:** Approval events fire correctly, log file is written after each approval.

### Tasks

**Task 3.1 — Language agent interface and Phase 1 agents**

File: `cleanclaw/core/language-agent.ts`

Define the shared `LanguageAgent` interface:
```typescript
export interface ProposedChange {
  filename: string;
  beforeLines: { lineNumber: number; content: string }[];
  afterLines: { lineNumber: number; content: string }[];
  explanation: string;
}

export interface LanguageAgent {
  stack: string;
  propose(plan: string, stepNumber: number, bridge: Bridge): Promise<ProposedChange>;
}
```

Every language agent in `cleanclaw/agents/` implements this interface. The `stack` property matches the config value. The `propose` method contains the agent's system prompt and any stack-specific instructions.

Files: `cleanclaw/agents/dotnet-agent.ts`, `svelte-agent.ts`, `angular-agent.ts`, `blazor-agent.ts`

Each implements `LanguageAgent`. Each has a tailored system prompt that includes stack-specific guidance (e.g. for .NET: prefer LINQ, avoid dynamic, use interfaces; for Svelte: use runes, avoid legacy reactive statements).

The system prompt instructs the LLM to return JSON matching the `ProposedChange` shape. The agent parses and validates the JSON response. If parsing fails, it retries once with an error message appended.

**Task 3.2 — Diff capture**

File: `cleanclaw/plans/diff-capture.ts`

Before any change is applied, reads the actual current state of the target file from disk and extracts the relevant lines. This is the "Before" in the log entry. It uses line numbers from the `ProposedChange`. If the file does not exist yet (new file case), Before is empty.

**Task 3.3 — Approval event handler**

File: `cleanclaw/core/verification-layer.ts`

The approval handler:
1. Receives a `ProposedChange` and the live "before" diff from diff-capture
2. Presents it to the user (stdout, formatted — Before/After with line numbers)
3. Waits for user input: `y` (approve), `n` (reject), or `s` (skip task)
4. Records the WHY summary — if approved, prompts "Why are you approving this? (press Enter to use the agent's explanation)"
5. Returns `{ approved: boolean; why: string }`

This uses `readline` from Node.js core — no extra dependency needed.

**Task 3.4 — Log writer**

File: `cleanclaw/plans/log-writer.ts`

Appends a log entry to `{plansDir}/task{id}/task{id}{variant}_log.md` after each approval event. The entry format:

```markdown
## Change N

**Filename:** src/core/pipeline.ts

**Before (lines 12-18):**
```
12: original code line
```

**After (lines 12-18):**
```
12: new code line
```

**Why:**
Agent reasoning or user override.

---
```

The log file is append-only. Never rewritten, never truncated.

**Task 3.5 — Wire approval into pipeline**

Update `cleanclaw/core/pipeline.ts` to call language agent → diff capture → approval handler → log writer in sequence. The approval handler's result determines whether the change is applied or skipped.

**Task 3.6 — Smoke test Weekend 3**

Run a hardcoded task through the full pipeline to the approval prompt. Approve it. Confirm the log entry is written correctly.

**Milestone:** Approval events firing interactively, log file being appended correctly after each approval.

### Files Created or Modified This Weekend
- `cleanclaw/core/language-agent.ts` — interface + base, new
- `cleanclaw/agents/dotnet-agent.ts` — new
- `cleanclaw/agents/svelte-agent.ts` — new
- `cleanclaw/agents/angular-agent.ts` — new
- `cleanclaw/agents/blazor-agent.ts` — new
- `cleanclaw/core/verification-layer.ts` — new
- `cleanclaw/plans/diff-capture.ts` — new
- `cleanclaw/plans/log-writer.ts` — new
- `cleanclaw/core/pipeline.ts` — updated

### Risk This Weekend
- Language agent JSON parsing failures. Mitigation: one retry with error context. If both attempts fail, surface the raw response to the user and skip the step.
- User approval UX is clunky in a raw terminal. Accept this for Phase 1 — it is intentional that the tool is developer-facing, not polished consumer UX.

---

## Weekend 4 — Diff Capture, Verification, and Full Pipeline Test

**Time estimate:** 10-14 hours

**Goal:** Full pipeline runs end to end with a real coding task. Plan and log files produced correctly. Diff capture reads actual file state.

### Tasks

**Task 4.1 — Harden diff capture**

`diff-capture.ts` currently reads lines by number. Harden it:
- Handle files with fewer lines than requested (return what exists)
- Handle new files (before = empty, annotate clearly in log)
- Handle binary files (skip, log a warning, do not crash)
- Handle encoding issues (default UTF-8, catch and warn)

**Task 4.2 — WHY summary at approval point**

The WHY field must be written at the moment of approval, not reconstructed later. Update `verification-layer.ts`:
- If user presses Enter with no input, use the language agent's `explanation` field verbatim
- If user types a WHY, use that instead
- WHY is stored with the approval event and passed to the log writer

**Task 4.3 — Variant manager**

File: `cleanclaw/plans/variant-manager.ts`

Manages task variants (A, B, C...). A variant is created when:
- The user explicitly starts a new variant ("this is out of scope, new variant")
- The scope boundary in the plan file is crossed (detected heuristically — if the language agent proposes a file not in the plan's Steps list)

For Phase 1, variant creation is triggered manually. The variant manager:
- Tracks the current variant letter per task
- Creates a new plan file for the variant
- Does not modify the original plan file

**Task 4.4 — End-to-end real task test**

Run a genuine coding task through the full pipeline:
- Task: "Add input validation to a TypeScript function"
- Use a real file in a temp test directory
- Plan file produced
- Language agent proposes a change
- Diff capture reads the real file before state
- Approval fires with correct Before/After displayed
- WHY captured
- Log file written
- Verify log matches the correct format

This weekend's primary output is confidence that the core workflow is correct before moving to multi-provider and CLI work.

**Task 4.5 — State manager skeleton**

File: `cleanclaw/core/state-manager.ts`

Stores and loads the current session state:
```typescript
export interface CleanClawState {
  projectName: string;
  currentTaskId: string;
  currentVariant: string;
  plansDir: string;
  lastUpdated: string;
}
```

Serialises to `.cleanclaw-state.json` in the project root. Used by the CLI (Weekend 6) to restore context. For this weekend, just write and read — no CLI integration yet.

**Task 4.6 — Unit tests for plan writer and log writer**

Write vitest tests for:
- `plan-writer.ts` — test that it writes correct content, throws on second write attempt
- `log-writer.ts` — test that it appends correctly on multiple calls
- `diff-capture.ts` — test edge cases (missing file, short file, new file)

Use `tmp` directories inside the test — clean up after.

**Milestone:** Full workflow running end to end. Plan and log files produced correctly. Diff capture reading actual file state.

### Files Created or Modified This Weekend
- `cleanclaw/plans/diff-capture.ts` — hardened
- `cleanclaw/plans/variant-manager.ts` — new
- `cleanclaw/core/verification-layer.ts` — WHY logic updated
- `cleanclaw/core/state-manager.ts` — new
- `cleanclaw/plans/plan-writer.test.ts` — new
- `cleanclaw/plans/log-writer.test.ts` — new
- `cleanclaw/plans/diff-capture.test.ts` — new

---

## Weekend 5 — Multi Provider, Config Merger, and Approval Granularity

**Time estimate:** 10-14 hours

**Goal:** Same task runs on Anthropic and OpenAI. Log output is structurally identical regardless of provider. Approval granularity setting works.

### Tasks

**Task 5.1 — Config merger**

File: `cleanclaw/core/config-merger.ts`

CleanClaw config can be defined at two levels:
1. Global: `~/.cleanclaw/config.json` — user-level defaults
2. Project: `./cleanclaw.config.json` — project overrides

The merger deep-merges project config over global config. Project config wins on all conflicts. The merged config is what the rest of the system sees.

**Task 5.2 — BYOK setup validation**

The config loader must now validate:
- If `provider` is `anthropic`, `anthropic.apiKey` must be present (or `ANTHROPIC_API_KEY` env var)
- If `provider` is `openai`, `openai.apiKey` must be present (or `OPENAI_API_KEY` env var)
- Clear error messages if missing: "Anthropic API key not found. Set ANTHROPIC_API_KEY or add it to cleanclaw.config.json"

**Task 5.3 — OpenAI bridge hardening**

OpenAI's API has different error shapes from Anthropic. Make sure `openai-bridge.ts`:
- Handles rate limit errors (429) with a clear message
- Handles auth errors (401) with a prompt to check the API key
- Surfaces the model name in the BridgeResponse so the log writer can record which model was used

Update the log entry format to include model used:
```markdown
**Model:** anthropic/claude-sonnet-4-5
```

**Task 5.4 — Approval granularity**

The `approvalGranularity` config setting controls when the approval prompt fires:

| Setting | Behaviour |
|---|---|
| `per-change` | Fires after every individual proposed change (most granular) |
| `per-file` | Fires once per file, after all proposed changes to that file are collected |
| `per-step` | Fires once per pipeline step, regardless of how many files are involved |

Update `verification-layer.ts` to group approval prompts according to this setting.

For `per-file`: collect all `ProposedChange` objects for the same filename, present them together, get one approval decision.

**Task 5.5 — Cross-provider smoke test**

Run the same task description through both providers:
1. Set `provider: anthropic` in config, run the task, save the plan and log files
2. Set `provider: openai` in config, run the same task, save to a different task ID

Compare the log files. The structure must be identical. The content will differ — that is expected.

**Task 5.6 — Agent router model selection**

Update `agent-router.ts` to read the model from config:
- Anthropic: default `claude-sonnet-4-5`, configurable
- OpenAI: default `gpt-4o`, configurable

**Milestone:** Same task runs on Anthropic and OpenAI. Log file structure is identical. Approval granularity setting changes behaviour correctly.

### Files Created or Modified This Weekend
- `cleanclaw/core/config-merger.ts` — new
- `cleanclaw/core/config-loader.ts` — updated (env var support, validation)
- `cleanclaw/bridges/openai-bridge.ts` — hardened
- `cleanclaw/core/agent-router.ts` — model selection added
- `cleanclaw/core/verification-layer.ts` — approval granularity added

---

## Weekend 6 — CLI, Project Switching, and Install Script

**Time estimate:** 10-14 hours

**Goal:** `cleanclaw` command works from anywhere on the machine. Project switching works. Install script tested.

### Tasks

**Task 6.1 — CLI entry point**

File: `bin/cleanclaw.js` (CommonJS to match `nemoclaw.js` pattern)

Commands:
```
cleanclaw init                  — initialise a project (creates cleanclaw.config.json)
cleanclaw run "<task>"          — run a task through the full pipeline
cleanclaw switch <project>      — switch active project
cleanclaw status                — show current project, task, variant
cleanclaw help                  — usage
```

Use `commander` (already a dependency in nemoclaw) for argument parsing.

**Task 6.2 — `cleanclaw init`**

The init command:
1. Prompts: project name
2. Prompts: provider (anthropic or openai)
3. Prompts: API key (or confirms env var is set)
4. Prompts: approval granularity (default: per-file)
5. Prompts: stack (which language agent to use — defaults to dotnet)
6. Writes `cleanclaw.config.json` to current directory
7. Creates `./plans/` directory
8. Writes `.cleanclaw-state.json` with the project name and initial state

**Task 6.3 — `cleanclaw run`**

Accepts a task description as the argument. Calls the pipeline. The task ID auto-increments based on existing plan files in `./plans/`.

**Task 6.4 — Project state save and load**

Update `state-manager.ts`:
- `saveState(state)` — writes `.cleanclaw-state.json` in the current project root
- `loadState(projectDir)` — reads and returns state from a project directory
- State includes: project name, current task ID and variant, plans dir path, last updated timestamp

**Task 6.5 — `cleanclaw switch`**

File: `cleanclaw/cli/run-workflow.ts` (updated to handle switch)

The switch command:
1. Takes a project name or path as argument
2. Saves current project state
3. Loads the target project's state
4. Updates a global state file at `~/.cleanclaw/active-project.json`
5. Reports: "Switched to [project name]. Last task: task03B."

**Task 6.6 — Install script**

File: `install.sh` (update the existing one or create a CleanClaw-specific one)

The install script:
1. Checks Node.js >= 22 is installed
2. Runs `npm install` in the repo root
3. Adds `bin/cleanclaw.js` to PATH (via `~/.bashrc` / `~/.zshrc` symlink)
4. Prompts the user to run `cleanclaw init` to start

**Task 6.7 — Smoke test CLI**

From a temp directory outside the repo:
1. Run `cleanclaw init`
2. Run `cleanclaw run "Add a hello world function"`
3. Confirm plan file and log file appear in `./plans/task01/`
4. Run `cleanclaw status`
5. Run `cleanclaw switch` to a second temp project and back

**Milestone:** `cleanclaw` command works from any directory. Project switching saves and restores context and plan file locations.

### Files Created or Modified This Weekend
- `bin/cleanclaw.js` — new CLI entry point
- `cleanclaw/cli/run-workflow.ts` — CLI wiring
- `cleanclaw/cli/setup-wizard.ts` — init wizard
- `cleanclaw/core/state-manager.ts` — save/load complete
- `install.sh` — updated or new

---

## Weekend 7 — Polish, Testing, and Launch

**Time estimate:** Full weekend (14-16 hours)

**Goal:** Real developers can install and use CleanClaw. GitHub repo is public. Launch posts are live.

### Tasks

**Task 7.1 — Setup wizard for first-time users**

File: `cleanclaw/cli/setup-wizard.ts`

A guided first-run experience:
1. Detect if this is a first run (no global `~/.cleanclaw/config.json`)
2. Walk through: provider choice, API key entry, model selection, default approval granularity, stack selection
3. Write global config
4. Offer to init first project immediately

This is what `cleanclaw init` calls internally on a fresh machine.

**Task 7.2 — End-to-end tests across Phase 1 stacks**

Write four test scenarios in `test/e2e/`:
- `.net` — task description for a C# method, verify plan and log format
- `svelte` — task description for a Svelte component change
- `angular` — task description for an Angular service
- `blazor` — task description for a Blazor component

These are integration tests that mock the bridge (no live API calls) and verify the full pipeline produces correct plan and log files.

**Task 7.3 — README**

The README must cover:
1. What CleanClaw is (one paragraph, no jargon)
2. Prerequisites (Node.js 22+, an Anthropic or OpenAI API key)
3. Install (one command)
4. First run (three commands: init, run, check the plans/ folder)
5. Config reference (the JSON fields, what each does)
6. Approval granularity explained with examples
7. Plan and log file format explained
8. Supported stacks (with a note that adding new language agents is straightforward)
9. Contributing

This README is a sales document as much as a technical one. Every developer who reads it should understand immediately why it exists and how to start in under 5 minutes.

**Task 7.4 — Screen capture demo**

Record a terminal session showing:
1. `cleanclaw init` — wizard completing
2. `cleanclaw run "Add input validation to the login function"` — plan file created, language agent proposes a change, approval prompt fires, user approves, log file written
3. Open the plan file and log file side by side — show the artefacts

Convert to a GIF using `ttyrec` + `ttygif` or `asciinema`. Embed in README.

**Task 7.5 — GitHub repository public**

1. Verify LICENSE is Apache 2.0 (already present from NemoClaw)
2. Update CONTRIBUTING.md to be CleanClaw-specific
3. Add GitHub issue templates for: bug report, feature request, "I used this for real work" (this last one is for collecting the evidence needed for the seed raise)
4. Tag the launch commit as `v0.1.0`
5. Make the repository public

**Task 7.6 — Launch posts**

Write and publish:
- **LinkedIn article:** "Why I built an AI audit trail for developers (and what I learned in 7 weekends)" — technical but accessible, ends with a link to the GitHub repo and a call for feedback
- **Reddit /r/programming or /r/devtools:** "Show HN style post — I built a tool that logs every AI-suggested code change with before/after diffs and requires human approval. Here's what real usage looks like."
- **Hacker News Show HN:** "Show HN: CleanClaw — audit trail and human approval layer for AI-assisted development"

Timing: publish all three on the same day, Monday morning UK time for maximum visibility.

**Task 7.7 — Feedback collection setup**

Before launch:
1. Create a simple GitHub Discussions category: "Real Usage Reports"
2. Pin a post: "Did you use CleanClaw for real work? Tell us what happened." — this is the evidence collection for the seed raise
3. Set up a simple email alias or Typeform for users who want to give longer feedback

**Milestone:** Real developers installing, using, and reporting back. At least 5 GitHub stars by end of weekend (a real but modest bar — if you can't get 5, the launch channel or messaging needs rethinking).

---

## Identified Risks and Gaps

### Risk 1 — NemoClaw dependency confusion (HIGH)

**Problem:** The repo is named `nemoclaw` in `package.json` and the existing source is NemoClaw infrastructure. A developer cloning the repo will be confused about what is NemoClaw and what is CleanClaw.

**Mitigation:** Rename the package to `cleanclaw` in `package.json` during pre-Weekend-1 setup. CleanClaw code lives in the top-level `cleanclaw/` directory, completely separate from NemoClaw's `src/lib/`. Add a comment in `src/lib/README.md` (or a similar marker) explaining that `src/lib/` is NemoClaw infrastructure and should not be modified.

### Risk 2 — WSL2 environment drift (MEDIUM)

**Problem:** Development happens on Windows with WSL2. If the install script or CLI assumes a Linux path layout but gets run in a Windows terminal by accident, things break silently.

**Mitigation:** Add a runtime check at the top of `bin/cleanclaw.js` that detects the shell environment and warns clearly if running in a Windows CMD/PowerShell context. The README should be explicit: CleanClaw CLI runs in WSL2 or a Unix shell.

### Risk 3 — LLM output reliability (MEDIUM)

**Problem:** The language agent asks the LLM to return structured JSON with a `ProposedChange` shape. LLMs don't always comply, especially with strict schemas.

**Mitigation:**
- System prompt includes a literal example of the expected JSON
- One retry on parse failure, with the error appended to the prompt
- If both fail: show raw output to user and skip the step (never crash)
- Consider moving to JSON mode / structured outputs in both Anthropic and OpenAI SDKs

### Risk 4 — Approval granularity complexity (LOW-MEDIUM)

**Problem:** `per-file` granularity requires collecting all changes for a file before prompting. This complicates the pipeline because the language agent may propose changes across multiple files in a single step.

**Mitigation:** For Phase 1, enforce a constraint: the language agent is prompted to propose changes to one file at a time. Multi-file changes become multiple sequential steps. This simplifies the granularity logic significantly and is actually better UX — smaller, clearer approval prompts.

### Risk 5 — Plan file format compliance (MEDIUM)

**Problem:** The planning agent generates the plan file. If the format drifts from the spec, the variant manager and log writer may break.

**Mitigation:** Add a `validatePlanFormat(markdown: string): boolean` function in `plan-writer.ts` that checks for required headings (# TaskXXX, ## Objective, ## Steps, ## Scope Boundary) before writing. If validation fails, surface the raw output and ask the user to proceed or abort.

### Risk 6 — No tests on Weekend 1-3 (LOW)

**Problem:** The first three weekends build a lot of code without tests. If something breaks in Weekend 4 or 5, tracing it back is hard.

**Mitigation:** Weekend 4 includes retroactive unit tests for the writers and diff capture. Accept the risk for Weekends 1-3 — these are the most exploratory phases and tests would slow initial momentum. The smoke tests at the end of each weekend act as a minimal safety net.

### Gap 1 — No model used recorded in log

The log format does not include which model was used. This is a key investor talking point ("provider agnostic from day one") and useful for debugging. Add `**Model:** provider/model-name` to every log entry. Addressed in Weekend 5 but keep in mind from Weekend 3 onward.

### Gap 2 — `switch-project.sh` referenced in plan doc but not in CleanClaw context

The plan doc lists `switch-project.sh` as a shell script. In the CleanClaw architecture, project switching is handled by `cleanclaw switch` (the CLI command). The shell script is redundant. Remove it from scope — the CLI handles this cleanly without a separate shell script.

---

## Sequencing Summary

| Weekend | Core Deliverable | Blocks |
|---|---|---|
| Pre-W1 | WSL2 + Docker setup, fork prep | Everything |
| 1 | AnthropicBridge live call | W2+ |
| 2 | Plan file produced by boss/planner | W3+ |
| 3 | Approval events + log file + Phase 1 language agents | W4+ |
| 4 | Full pipeline end-to-end, hardened | W5+ |
| 5 | Multi-provider + approval granularity | W6+ |
| 6 | CLI + project switching + install | W7 |
| 7 | Polish, tests, launch | — |

No weekend can be safely skipped or reordered. Each milestone is a hard dependency for the next.

---

## Code Style Constraints (For All Implementing Agents)

- Write simple, readable code. Prefer direct logic over clever abstractions.
- Do not introduce utility abstractions (pipelines, group maps, chained projections) unless there is a demonstrated need.
- One logical change per step — no bundling.
- All new TypeScript is ESM (`.js` extensions in imports, `"type": "module"` in package.json).
- No `any` types. Prefer explicit interfaces.
- No external dependencies beyond `@anthropic-ai/sdk`, `openai`, and `commander`. Node.js built-ins only for everything else.

---

## Success Criteria Mapping to Phase 1 Goals

| Phase 1 Success Criterion | How This Plan Delivers It |
|---|---|
| 50+ developers installed and used it | Weekend 7 launch posts + README quality + install simplicity |
| 10 used it for real work | "Real Usage Reports" GitHub Discussions category + install ease |
| Clear feedback on what they wish it did | Issue templates + Discussions setup |
| 2-3 asked about a paid/managed version | LinkedIn article targets this audience explicitly |
| Evidence of audit/consistency use case | The artefacts (plan + log files) are the evidence — demo GIF shows this |
| Most common stack configs understood | Issue template for "I used this" collects stack info |
