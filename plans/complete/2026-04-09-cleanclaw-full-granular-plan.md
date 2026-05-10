# CleanClaw — Full Granular Build Plan

**Date:** 2026-04-09
**Source plan:** 2026-04-02-cleanclaw-phase1.md
**Purpose:** Educational expansion — every step explains What, Why, and Produces.

---

**Provider Strategy Update (2026-04-09):**
- **Primary agent runtime:** OpenHands (formerly OpenDevin) — Docker-native, REST API, supports multiple LLM backends
- **Primary LLM:** OpenAI GPT-4o via `openai-bridge.ts`
- **Secondary LLM:** Anthropic Claude — possible second agent ("Claude as backup") — Anthropic may restrict coding agent API access but is unlikely to block all API usage entirely. Keep the Anthropic bridge as a fallback option.

---

## Target Users

Target users are developers and vibecoders who need more control over AI-assisted coding — specifically: audit trail, step-by-step approval, and output format choice.

---

## How to read this plan

Each sub-step has three bullets:
- **What** — the exact command or file operation to perform
- **Why** — the problem it solves or what it enables
- **Produces** — the concrete output you can verify

---

## Environment Phase — Pre-Weekend-1 Setup (E1–E9)

These are Windows/WSL2 environment steps. Do them before writing a single line of CleanClaw code. If your environment is broken, every subsequent weekend will have mysterious failures.

---

### E1 — Enable WSL2 in Windows Features

**What:** Open PowerShell as Administrator and run `wsl --install`. Reboot when prompted.

**Why:** WSL2 (Windows Subsystem for Linux 2) is a full Linux kernel running inside Windows via Hyper-V virtualisation. CleanClaw's install script and CLI are designed for Unix shells — they use Unix paths (`~/`, `~/.bashrc`), Unix file permissions, and Unix process behaviour. Without WSL2, you would have to maintain a Windows-native version of everything, which doubles the maintenance burden and confuses users.

**Produces:** WSL2 feature enabled in Windows. After reboot, `wsl --version` in PowerShell prints the WSL version number.

---

### E2 — Install Ubuntu 22.04 LTS

**What:** Open Microsoft Store, search "Ubuntu 22.04 LTS", install it. On first launch, it will ask you to create a Unix username and password. Use a simple username (e.g. your first name, lowercase). This is your WSL2 user — it does not need to match your Windows account.

**Why:** Ubuntu 22.04 LTS is a Long Term Support release, meaning it gets security patches until 2027. It is the most widely-used Linux distro for development and is what most Node.js documentation and Docker tutorials assume. Using LTS avoids the pain of a distro EOLing mid-project.

**Produces:** A working Ubuntu terminal accessible via `wsl` in PowerShell or via the "Ubuntu 22.04 LTS" shortcut in Start. `uname -a` inside WSL prints a Linux kernel version string.

---

### E3 — Install Docker Desktop for Windows (WSL2 backend)

**What:** Download Docker Desktop from `https://www.docker.com/products/docker-desktop/`. During install, select "Use WSL2 based engine" when prompted. After install, open Docker Desktop settings and ensure the Ubuntu 22.04 integration is enabled under Resources > WSL Integration.

**Why:** Docker is not needed for CleanClaw's core feature (LLM calls + file diffs), but it is needed for the NemoClaw sandbox infrastructure that lives alongside CleanClaw in the same repo. More importantly, having Docker working validates that WSL2's Linux kernel integration is functioning correctly — if Docker works, Node.js and npm will too. It also enables future CleanClaw features like sandboxed code execution.

**Produces:** `docker` command available inside WSL2 terminal. `docker run hello-world` prints "Hello from Docker!" (see E4).

---

### E4 — Verify Docker works inside WSL2

**What:** Open your Ubuntu terminal. Run `docker run hello-world`.

**Why:** This command pulls a tiny test image from Docker Hub and runs it. If it prints "Hello from Docker!" the entire Docker + WSL2 integration chain is working: Docker Desktop is running, the WSL2 integration is active, and networking is reachable. If it fails, you have an environment problem to fix now, not in Weekend 3 when you're mid-implementation.

**Produces:** "Hello from Docker!" printed in the WSL2 terminal. Confirms Docker Desktop + WSL2 integration is healthy.

---

### E5 — Install Node.js 22.x inside WSL2

**What:** Inside WSL2 Ubuntu, run:
```bash
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc
fnm install 22
fnm use 22
node --version
```

Use `fnm` (Fast Node Manager) rather than `apt install nodejs` because apt's Node.js package is usually severely outdated (v12 or v14). fnm lets you install any Node.js version and switch between them per project.

**Why:** CleanClaw requires Node.js 22.x. This is because:
1. Node.js 22 has native ESM module support that is stable — CleanClaw's code uses `"type": "module"` in `package.json`
2. Node.js 22 includes built-in `fetch` (no need for `node-fetch`), which is used by the SDK libraries
3. The Anthropic SDK v0.30+ and the OpenAI SDK v4+ both require Node.js 18+; using 22 gives headroom

Running an older Node.js causes confusing import errors (`ERR_REQUIRE_ESM`, `SyntaxError: Unexpected token 'export'`) that are hard to diagnose if you don't know the root cause.

**Produces:** `node --version` prints `v22.x.x` inside WSL2. `npm --version` prints an 8.x or 10.x version.

---

### E6 — Clone the repo and run `npm install` inside WSL2

**What:** Inside WSL2, navigate to the Windows file system and the repo:
```bash
cd /mnt/c/Users/StefanVesely/source/repos/Work/CleanClaw
npm install
```

Note: `/mnt/c/` is how WSL2 sees the `C:\` drive. Your Windows files are fully accessible from WSL2 via this mount path.

**Why:** The repo already has a `package.json` with dependencies (from NemoClaw). Running `npm install` here — inside WSL2, not in a Windows PowerShell — is important because:
1. It creates `node_modules/` with Linux binaries. Some npm packages include native binaries (e.g. `esbuild`, `sharp`). The Windows binary and the Linux binary are different. If you ran `npm install` in Windows and then try to run code in WSL2, native modules crash.
2. It confirms your Node.js version satisfies the `engines` field in `package.json`.

**Produces:** `node_modules/` directory populated. No errors. You can now run `npx vitest` and `npx tsc` from inside WSL2.

---

### E7 — Create the public GitHub repository

**What:**
1. Go to `https://github.com/new`
2. Repository name: `cleanclaw`
3. Visibility: **Public** (this is the open-source product)
4. Initialise with: no README (you'll push the existing repo)
5. License: Apache 2.0 (this is already in the NemoClaw repo — match it)
6. Click "Create repository"
7. Follow the "push an existing repository" instructions GitHub shows you

**Why:** Creating the public repo before you write CleanClaw code establishes the project's public identity from day one. Every commit from this point forward is part of the open-source history. This is evidence for the seed raise — investors can see the commit history and development velocity. An Apache 2.0 license is standard for developer tools that want commercial adoption without legal friction.

**Produces:** `https://github.com/[your-username]/cleanclaw` is live and public. Existing NemoClaw history is visible. The repo is the source of truth going forward.

---

### E8 — Update `package.json` to rename the package

**What:** Open `package.json` in the repo root. Change:
- `"name": "nemoclaw"` → `"name": "cleanclaw"`
- `"description"` → a CleanClaw-specific description: `"Audit trail and human approval layer for AI-assisted development"`
- `"repository": { "url": "..." }` → the new GitHub URL
- `"bin"` → add `"cleanclaw": "./bin/cleanclaw.js"` alongside the existing `"nemoclaw"` entry

**Why:** npm uses the `name` field in `package.json` as the package identity. When you eventually run `npm publish`, this is the name developers see on npmjs.com. When they run `npm install -g cleanclaw`, npm finds it by this name. Updating it now prevents a confusing situation where the tool calls itself `nemoclaw` in error messages while marketing calls it `cleanclaw`. The `bin` entry tells npm which JavaScript file to make executable when the package is installed globally — this is how `cleanclaw` becomes a command on the PATH.

**Produces:** `package.json` with correct `name`, `description`, `repository`, and `bin` fields. The package identity is now CleanClaw.

---

### E9 — Create the `bin/cleanclaw.js` stub and foundation commit

**What:**
1. Create `bin/cleanclaw.js` with the following content:
```javascript
#!/usr/bin/env node
// CleanClaw CLI entry point
// Implementation begins Weekend 6 — this stub confirms the binary is wired up
console.log('CleanClaw v0.1.0 — not yet implemented');
```
2. Make it executable: `chmod +x bin/cleanclaw.js`
3. Commit and push:
```bash
git add package.json bin/cleanclaw.js
git commit -m "chore: rename package to cleanclaw, add cli stub"
git push
```

**Why:** The stub serves two purposes. First, it proves the `bin` entry in `package.json` is wired up correctly — you can run `node bin/cleanclaw.js` immediately. Second, the foundation commit establishes a clean "before" point in git history. When you demo CleanClaw to investors, you can show the commit graph and point to this commit as "Day 1, before any CleanClaw code existed."

**Produces:** `bin/cleanclaw.js` on disk. A foundation commit in git history. `node bin/cleanclaw.js` prints the stub message.

---

## Weekend 1 — Foundation and Bridge Proof of Concept

**Goal:** Prove CleanClaw can make a live LLM API call through its own bridge layer, end to end.

**Why this first:** The entire product depends on LLM calls working. If the Anthropic SDK has ESM import issues in this Node.js setup, you want to know on Day 1 — not after building five layers of abstraction on top of it.

---

### Step 1.1a — Create the `cleanclaw/` directory tree

**What:** Inside WSL2, from the repo root, run:
```bash
mkdir -p cleanclaw/core cleanclaw/bridges cleanclaw/agents cleanclaw/plans cleanclaw/cli cleanclaw/config
```

**Why:** TypeScript projects use folder-based module separation. Each folder is a "domain":
- `core/` — orchestration logic (pipeline, boss, planner, router, state)
- `bridges/` — LLM provider wrappers (Anthropic, OpenAI) — isolated here so adding a new provider means adding one file
- `agents/` — language-specific agents (dotnet, svelte, angular, blazor) — same isolation principle
- `plans/` — file I/O for plan and log files (writers, diff capture)
- `cli/` — command-line interface (entry point, setup wizard)
- `config/` — config schema and defaults

Separating domains into folders means you can read any filename and immediately know its responsibility. `bridges/openai-bridge.ts` — obviously the OpenAI wrapper. No guessing.

**Produces:** Six subdirectories under `cleanclaw/`.

---

### Step 1.1b — Create placeholder TypeScript files in `cleanclaw/core/`

**What:** Create these files, each containing only `export {};`:
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
```

`export {}` makes TypeScript treat the file as a module rather than a global script. A file without any import or export statement is treated as a global script by TypeScript — that causes confusing errors when you try to import from it later.

**Why:** Creating placeholder files up front lets TypeScript's compiler and your IDE index the entire module graph from day one. Import paths between files can be written before the implementation exists, giving you autocomplete and "go to definition" working immediately. Errors will be about missing logic (expected and intentional) rather than missing files (confusing).

**Produces:** 9 `.ts` files in `cleanclaw/core/`, each containing `export {}`.

---

### Step 1.1c — Create placeholder TypeScript files in `cleanclaw/plans/`, `cleanclaw/bridges/`, `cleanclaw/agents/`, `cleanclaw/cli/`

**What:** Create these files, each containing only `export {};`:
```
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
```

**Why:** Same reason as Step 1.1b — IDE indexing, no "file not found" import errors while developing. The four agent files also establish the pattern: one file per language. When you add Python support later, the pattern is obvious.

**Produces:** 12 more `.ts` files across four directories. Total placeholder files: 21.

---

### Step 1.1d — Create the config files

**What:** Create `cleanclaw/config/config-schema.ts` with `export {};` and `cleanclaw/config/default-config.json` with an empty object `{}` for now. Both will be filled in Step 1.3.

**Why:** The config directory is the last of the six. Creating it now completes the full directory tree and makes the structure reviewable before any logic is written.

**Produces:** `cleanclaw/config/` with two placeholder files. The full `cleanclaw/` tree is now visible in your IDE's file explorer.

---

### Step 1.2a — Install the Anthropic SDK

**What:** Inside WSL2 from the repo root, run:
```bash
npm install @anthropic-ai/sdk
```

Then check `package.json` — a new entry should appear under `dependencies`:
```json
"@anthropic-ai/sdk": "^0.x.x"
```

Pin the exact version by removing the `^` (caret): `"0.x.x"` not `"^0.x.x"`. This ensures future `npm install` calls on other machines get the same version you tested with.

**Why:** The Anthropic SDK is the library that handles authentication, request formatting, retry logic, and response parsing for the Anthropic Claude API. Without it you would need to hand-write HTTP calls, handle API versioning headers, and manage rate limits yourself. The SDK handles all of this. Pinning the version ensures the behaviour your smoke tests pass on is the behaviour every user gets.

**Produces:** `@anthropic-ai/sdk` in `node_modules/` and `package.json`. `import Anthropic from '@anthropic-ai/sdk'` works without errors.

---

### Step 1.2b — Install the OpenAI SDK

**What:** Run `npm install openai`. Pin the version in `package.json` as in Step 1.2a.

**Why:** The OpenAI bridge (Weekend 2) uses this SDK. Installing it now alongside the Anthropic SDK verifies they do not conflict. The two SDKs are independent libraries — there is no known conflict — but confirming this early prevents a surprise in Weekend 2 when you go to import both in the same project.

**Produces:** `openai` in `node_modules/` and `package.json`. Both SDKs installed simultaneously without conflict.

---

### Step 1.2c — Verify both SDKs can be imported

**What:** Create a throwaway file `test/smoke/sdk-import-check.ts` with:
```typescript
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
console.log('Anthropic SDK loaded:', typeof Anthropic);
console.log('OpenAI SDK loaded:', typeof OpenAI);
```

Run it with: `npx ts-node --esm test/smoke/sdk-import-check.ts`

**Why:** ESM import compatibility is the single most common source of pain in Node.js TypeScript projects. The project uses `"type": "module"` in `package.json`, which means all `.js` files are treated as ES modules. Some SDK versions have quirks with this. If the import works here, you know the environment is correctly set up for the rest of the project.

**Produces:** Both SDKs import without errors. "Anthropic SDK loaded: function" and "OpenAI SDK loaded: function" printed to stdout.

---

### Step 1.3a — Define the `CleanClawConfig` interface

**What:** Replace the `export {}` in `cleanclaw/config/config-schema.ts` with:
```typescript
export interface CleanClawConfig {
  provider: 'anthropic' | 'openai';
  anthropic?: {
    apiKey: string;
    model: string;
  };
  openai?: {
    apiKey: string;
    model: string;
  };
  approvalGranularity: 'per-step' | 'per-file' | 'per-change';
  logFormat: 'markdown' | 'json';
  projectName: string;
  plansDir: string;
  planPath?: string;
  stack: string;
}
```

**Why:** This interface is the contract between the user's config file and the rest of the system. Every module that reads config will import and use this type. Because TypeScript is structurally typed, if you add a new field to the config JSON but forget to add it to this interface, TypeScript will tell you. The `stack` field is a `string` (not a union type) because new language agents can be added without changing this schema — the valid values are determined by which agent files exist in `cleanclaw/agents/`, not by a hardcoded list here.

**Produces:** `CleanClawConfig` interface exported from `config-schema.ts`. All config-related code can now import this type.

---

### Step 1.3b — Write `default-config.json`

**What:** Replace the `{}` in `cleanclaw/config/default-config.json` with:
```json
{
  "provider": "openai",
  "approvalGranularity": "per-file",
  "logFormat": "markdown",
  "plansDir": "./plans",
  "stack": "dotnet"
}
```

**Why:** The default config is the fallback when a user's project config doesn't specify a field. It deliberately omits `apiKey` and `projectName` — those must always come from the project config. Defaulting to `"provider": "openai"` reflects the primary bridge (GPT-4o). Anthropic is kept as a possible second option — see provider strategy note at the top of this plan. Defaulting to `"per-file"` approval granularity is the best default for most developers: not so granular that you approve every small line, not so coarse that you rubber-stamp entire steps.

**Produces:** `default-config.json` with four default fields. Used by the config loader in Step 1.3c.

---

### Step 1.3c — Implement `config-loader.ts`

**What:** Replace the `export {}` in `cleanclaw/core/config-loader.ts` with a function that:
1. Reads `cleanclaw.config.json` from the current working directory using `fs.readFileSync`
2. Deep-merges the project config over the defaults from `default-config.json`
3. Validates that the `apiKey` for the selected `provider` is present (or the env var `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`)
4. Throws a plain `Error` with a human-readable message if validation fails
5. Returns the merged config typed as `CleanClawConfig`

Use Node.js built-in `fs` and `path` only. No JSON schema validation library.

**Why:** A config loader exists separately from the rest of the code so that the loading and validation logic is in one place. If the config format ever changes, you edit one file. If the error message for a missing API key is wrong, you edit one file. The "throw on missing API key" rule is important: it is better to crash immediately with a clear message ("Anthropic API key not found. Set ANTHROPIC_API_KEY or add it to cleanclaw.config.json") than to proceed and get a cryptic 401 error from the API three steps into a task.

**Produces:** `config-loader.ts` exports a `loadConfig(): CleanClawConfig` function. Importing and calling it from any other file gives back a fully typed config object.

---

### Step 1.4a — Define the `Bridge` interface and message types

**What:** In `cleanclaw/bridges/anthropic-bridge.ts`, before the `AnthropicBridge` class, define:
```typescript
export interface BridgeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BridgeResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface Bridge {
  send(messages: BridgeMessage[], systemPrompt?: string): Promise<BridgeResponse>;
}
```

**Why:** The `Bridge` interface is the contract all bridge implementations must satisfy. Every other module (pipeline, planning agent, language agent) only ever calls `bridge.send(...)`. They never know whether they are talking to Anthropic or OpenAI. This is the entire basis of the "provider agnostic" claim. If you wrote the Anthropic bridge without this interface first, the pipeline code would end up calling Anthropic-specific methods directly, and swapping providers would require changing the pipeline code — defeating the purpose.

**Produces:** Three exported interfaces in `anthropic-bridge.ts`. Any future bridge file that imports and implements `Bridge` is guaranteed to work with the rest of the system.

---

### Step 1.4b — Implement `AnthropicBridge`

**What:** Below the interfaces in `cleanclaw/bridges/anthropic-bridge.ts`, implement:
```typescript
export class AnthropicBridge implements Bridge {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async send(messages: BridgeMessage[], systemPrompt?: string): Promise<BridgeResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      content,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
```

No streaming. Simple request/response only. The `usage` fields are recorded so the log writer (Weekend 3) can write them to the log file — this becomes an audit trail of API cost per task.

**Why:** The bridge wraps the Anthropic SDK's `messages.create` call behind a generic interface. The key design decisions here:
- `max_tokens: 4096` is a safe default for code generation — large enough for most responses
- The `usage` return value is not optional: we always capture it so there is always a cost record
- No streaming in Phase 1 keeps the implementation simple — streaming adds buffering complexity without changing the output for short responses

**Produces:** `AnthropicBridge` class implementing `Bridge`. Can be instantiated with an API key and model name, and its `send()` method makes live Anthropic API calls.

---

### Step 1.5a — Create the smoke test script

**What:** Create `test/smoke/weekend1-smoke.ts`:
```typescript
import { loadConfig } from '../../cleanclaw/core/config-loader.js';
import { OpenAiBridge } from '../../cleanclaw/bridges/openai-bridge.js';

const config = loadConfig();
if (!config.openai?.apiKey) {
  throw new Error('No OpenAI API key in config');
}

// Primary bridge: OpenAI GPT-4o. Anthropic bridge exists as possible second ("Claude as backup") — see provider strategy.
const bridge = new OpenAiBridge(config.openai.apiKey, config.openai.model ?? 'gpt-4o');
const response = await bridge.send([
  { role: 'user', content: 'Respond with exactly the word WORKING and nothing else.' }
]);

if (response.content.trim() === 'WORKING') {
  console.log('Weekend 1 milestone: PASS');
  console.log(`Model: ${response.model}`);
  console.log(`Tokens used: ${response.usage.inputTokens} in, ${response.usage.outputTokens} out`);
} else {
  console.error('FAIL — unexpected response:', response.content);
  process.exit(1);
}
```

**Why:** This test does not use a mock. It makes a real API call. That is intentional — the purpose of this smoke test is to prove the full chain: config loads, API key is valid, SDK imports work, ESM module resolution works, the Anthropic API accepts the request, and the response parses correctly. A mocked test would not catch any of these. The "WORKING" prompt is maximally simple — if the API call fails, the failure is definitely in your code or config, not in the prompt.

**Produces:** `test/smoke/weekend1-smoke.ts` ready to run.

---

### Step 1.5b — Create `cleanclaw.config.json` for local development

**What:** Create `cleanclaw.config.json` in the repo root (this is the project config the config loader reads):
```json
{
  "provider": "openai",
  "openai": {
    "apiKey": "YOUR_OPENAI_API_KEY_HERE",
    "model": "gpt-4o"
  },
  "anthropic": {
    "apiKey": "YOUR_ANTHROPIC_API_KEY_HERE",
    "model": "claude-sonnet-4-5"
  },
  "projectName": "cleanclaw-dev",
  "plansDir": "./plans",
  "stack": "dotnet"
}
// Note: anthropic block kept as possible second agent. Primary is openai.
```

Then add `cleanclaw.config.json` to `.gitignore` to ensure the API key is never committed.

**Why:** The config file contains an API key — a secret. It must never be committed to git. Adding it to `.gitignore` before you create the file prevents an accidental commit. This is a single-entry `.gitignore` addition: `cleanclaw.config.json`. The README will tell users to create this file manually, which is why committing it to the repo would be wrong — it is intentionally local-only.

**Produces:** `cleanclaw.config.json` in repo root (not tracked by git). `.gitignore` updated. Config loader can now find and read the file.

---

### Step 1.5c — Run the smoke test and confirm the milestone

**What:** Inside WSL2, from the repo root:
```bash
npx ts-node --esm test/smoke/weekend1-smoke.ts
```

Expected output:
```
Weekend 1 milestone: PASS
Model: claude-sonnet-4-5-20251022
Tokens used: 12 in, 3 out
```

If it fails with an ESM error: check that `tsconfig.json` has `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`. If it fails with a 401: check the API key in `cleanclaw.config.json`.

**Why:** The milestone is not "the code exists" — it is "the code works with a live API call". Running this test is what makes Weekend 1 done. If you skip this and go straight to Weekend 2, you might build the entire pipeline only to find the bridge was broken in a subtle way.

**Produces:** "Weekend 1 milestone: PASS" printed to stdout. A confirmed working end-to-end path from config file to live Anthropic API response.

---

## Weekend 2 — Core Pipeline and Boss/Planning Agents

**Goal:** Boss agent orchestrates a task, delegates to planning agent, produces a plan file on disk.

**Why this order:** The plan file is CleanClaw's most visible output. Getting it working in Weekend 2 means every subsequent weekend produces a real artefact you can demo to investors and early users.

---

### Step 2.1a — Implement `OpenAiBridge`

**What:** Replace `export {}` in `cleanclaw/bridges/openai-bridge.ts` with an `OpenAiBridge` class that:
1. Imports `OpenAI` from `'openai'`
2. Takes `apiKey` and `model` in the constructor
3. Implements `send(messages, systemPrompt?)` using `openai.chat.completions.create`
4. Returns a `BridgeResponse` with the same shape as `AnthropicBridge`

Import `Bridge`, `BridgeMessage`, and `BridgeResponse` from `anthropic-bridge.ts` — do not redefine them. Those types live in the bridges directory and are shared.

**Why:** The OpenAI bridge must satisfy the same `Bridge` interface as the Anthropic bridge. The rest of the system calls `bridge.send()` — it never knows which provider it is talking to. If you wrote the OpenAI bridge with a different method name or different return shape, you would break this guarantee. The symmetry is the entire value of the bridge pattern.

**Produces:** `OpenAiBridge` class in `openai-bridge.ts`. Both bridges implement the same `Bridge` interface. The rest of the system can treat them interchangeably.

---

### Step 2.2a — Implement `agent-router.ts`

**What:** Replace `export {}` in `cleanclaw/core/agent-router.ts` with a function:
```typescript
export function resolveBridge(config: CleanClawConfig): Bridge {
  if (config.provider === 'anthropic') {
    return new AnthropicBridge(config.anthropic!.apiKey, config.anthropic?.model ?? 'claude-sonnet-4-5');
  }
  if (config.provider === 'openai') {
    return new OpenAiBridge(config.openai!.apiKey, config.openai?.model ?? 'gpt-4o');
  }
  throw new Error(`Unknown provider: ${config.provider}`);
}
```

And a second function for resolving the language agent (stub for now — returns `null`, will be wired in Weekend 3):
```typescript
export function resolveLanguageAgent(config: CleanClawConfig): null {
  return null; // language agents wired in Weekend 3
}
```

**Why:** The router is a lookup table, not a framework. It reads a config value and returns the right implementation. The key design rule here: keep it simple. A `switch` or `if/else` is the right tool. Do not use a plugin registry or dependency injection container — that is premature abstraction. The comment on `resolveLanguageAgent` is intentional: it is a placeholder with an honest comment, not dead code.

**Produces:** `agent-router.ts` exports `resolveBridge` and `resolveLanguageAgent`. Calling `resolveBridge(config)` returns the correct bridge instance for the configured provider.

---

### Step 2.3a — Implement `planning-agent.ts`

**What:** Replace `export {}` in `cleanclaw/core/planning-agent.ts` with a class that:
1. Takes a `Bridge` in the constructor
2. Has a `plan(taskDescription: string): Promise<string>` method
3. The method sends a message to the bridge with a system prompt that specifies the exact plan format
4. Returns the raw markdown string from the bridge response

The system prompt must include a literal example of the plan format:
```
You are a software planning agent. When given a task description, produce a plan in this exact markdown format:

# Task[ID]

## Objective
[One paragraph describing what the task achieves]

## Steps
1. [Step description] — [file(s) expected to change]
2. [Step description] — [file(s) expected to change]

## Scope Boundary
[What is explicitly out of scope]

Respond only with the markdown. No preamble, no explanation.
```

**Why:** The planning agent's entire job is to produce a consistently formatted markdown document. The system prompt is therefore extremely prescriptive — it gives the LLM a literal template to fill in. This is not "trusting the LLM to figure out the format" — it is giving the LLM the exact schema with an example. Strict prompting here reduces the rate of format violations that would cause `plan-writer.ts` (Step 2.4a) to reject the output.

**Produces:** `planning-agent.ts` exports `PlanningAgent` class. Calling `planningAgent.plan("Add a login function")` returns a markdown string in the specified format.

---

### Step 2.4a — Implement `plan-writer.ts`

**What:** Replace `export {}` in `cleanclaw/plans/plan-writer.ts` with a function:
```typescript
export function writePlan(taskId: string, variant: string, markdown: string, plansDir: string): string {
  const dir = path.join(plansDir, `task${taskId}`);
  const filename = `task${taskId}${variant}_plan.md`;
  const filepath = path.join(dir, filename);

  if (fs.existsSync(filepath)) {
    throw new Error(`Plan file already exists: ${filepath}. Create a new variant instead.`);
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, markdown, 'utf-8');
  return filepath;
}
```

Also add a validation helper inside the same file:
```typescript
function validatePlanFormat(markdown: string): void {
  const required = ['## Objective', '## Steps', '## Scope Boundary'];
  for (const heading of required) {
    if (!markdown.includes(heading)) {
      throw new Error(`Plan is missing required section: ${heading}`);
    }
  }
}
```

Call `validatePlanFormat(markdown)` before writing.

**Why:** The "throw if file already exists" rule enforces the "plan as immutable record of intent" principle. Once a plan is written, it represents what was agreed at the start of the task. Allowing it to be overwritten would mean the historical record could be silently revised. If a plan needs to change, the answer is a new variant (task01B, task01C), not an overwrite of task01A. The format validation catches cases where the LLM produced off-format output before it is committed to disk.

**Produces:** `plan-writer.ts` exports `writePlan`. Creates `plans/task01/task01A_plan.md` (or the relevant ID/variant). Throws on second write attempt. Throws on invalid format.

---

### Step 2.5a — Implement `boss-agent.ts`

**What:** Replace `export {}` in `cleanclaw/core/boss-agent.ts` with a class that:
1. Takes a `PlanningAgent` and a `plansDir` in the constructor
2. Has a `run(taskDescription: string, taskId: string, variant: string): Promise<{ planPath: string; planContent: string }>` method
3. The method: calls `planningAgent.plan(taskDescription)`, then `writePlan(taskId, variant, planContent, plansDir)`, then returns both values

**Why:** The boss agent is the entry point for a task from the user's perspective. It is deliberately thin — its only job is to coordinate the planning and writing steps. It does not contain planning logic (that is `planning-agent.ts`) and it does not contain file logic (that is `plan-writer.ts`). This separation means each component can be tested independently. If the boss returns a wrong path, you look at `boss-agent.ts`. If the plan content is malformed, you look at `planning-agent.ts`. If the file is in the wrong location, you look at `plan-writer.ts`.

**Produces:** `boss-agent.ts` exports `BossAgent`. Calling `bossAgent.run(description, '01', 'A')` runs the full planning flow and returns the plan file path and content.

---

### Step 2.6a — Implement `pipeline.ts` (thin orchestration layer)

**What:** Replace `export {}` in `cleanclaw/core/pipeline.ts` with a function:
```typescript
export async function runPipeline(taskDescription: string, config: CleanClawConfig): Promise<void> {
  const bridge = resolveBridge(config);
  const planningAgent = new PlanningAgent(bridge);
  const taskId = await getNextTaskId(config.plansDir); // utility to scan plans/ dir and increment
  const variant = 'A';

  const boss = new BossAgent(planningAgent, config.plansDir);
  const { planPath, planContent } = await boss.run(taskDescription, taskId, variant);

  console.log(`Plan written: ${planPath}`);
  console.log(planContent);
}
```

Also implement the `getNextTaskId` helper inside `pipeline.ts`:
- Reads the `plansDir` directory
- Counts how many `taskXX` subdirectories exist
- Returns the next number, zero-padded to two digits: `'01'`, `'02'`, etc.

**Why:** The pipeline is the composition layer. It knows about the entire sequence but does not contain logic for any single step. Its value is in the ordering: bridge → planning agent → boss → output. When you add the language agent in Weekend 3, you add it here in the pipeline, not by changing `boss-agent.ts` or `planning-agent.ts`. The pipeline is where the sequence lives.

**Produces:** `pipeline.ts` exports `runPipeline`. Calling it with a task description and config runs boss → planner → plan writer and prints the result.

---

### Step 2.7a — Smoke test Weekend 2

**What:** Create `test/smoke/weekend2-smoke.ts`:
```typescript
import { loadConfig } from '../../cleanclaw/core/config-loader.js';
import { runPipeline } from '../../cleanclaw/core/pipeline.js';

const config = loadConfig();
await runPipeline('Add a TypeScript function that returns the sum of two numbers', config);
```

Run it. Open `./plans/task01/task01A_plan.md`. Verify it contains `## Objective`, `## Steps`, and `## Scope Boundary` with real content.

**Why:** This test is not just "does it run without crashing" — it is "does the plan file look right". A plan file with all three headings present, realistic content, and a path that matches `plans/task01/task01A_plan.md` proves the entire Weekend 2 chain works: bridge → planning agent → plan writer → file system.

**Produces:** `./plans/task01/task01A_plan.md` on disk with correct content. "Plan written: ./plans/task01/task01A_plan.md" printed to stdout.

---

## Weekend 3 — Language Agent and Approval Handler

**Goal:** Approval events fire interactively, log file is written after each approval.

---

### Step 3.1a — Define the `LanguageAgent` interface and `ProposedChange` type

**What:** Replace `export {}` in `cleanclaw/core/language-agent.ts` with:
```typescript
import type { Bridge } from '../bridges/anthropic-bridge.js';

export interface ProposedChange {
  filename: string;
  beforeLines: { lineNumber: number; content: string }[];
  afterLines: { lineNumber: number; content: string }[];
  explanation: string;
}

export interface LanguageAgent {
  stack: string;
  propose(stepBody: string, bridge: Bridge): Promise<ProposedChange>;
}
```

**Why:** This interface is the contract that every language agent must satisfy. The `propose` method receives the plan markdown and a step number — it knows which part of the plan to act on. It returns a `ProposedChange` which contains the exact line numbers, before content, and after content. By returning line numbers (not just raw strings), the approval display can show the user exactly which lines are being modified. The `explanation` field is the agent's reasoning — it becomes the default WHY in the approval log if the user does not override it.

**Produces:** `language-agent.ts` exports `LanguageAgent` interface and `ProposedChange` type. All four language agent files will implement `LanguageAgent`.

---

### Step 3.1b — Implement `dotnet-agent.ts`

**What:** Replace `export {}` in `cleanclaw/agents/dotnet-agent.ts` with a class implementing `LanguageAgent`:
- `stack = 'dotnet'`
- The `propose` method sends to the bridge with a system prompt that includes .NET-specific guidance:
  - Prefer LINQ over explicit loops
  - Avoid `dynamic` type
  - Use interfaces, not concrete types in method signatures
  - Null safety: use nullable reference types (`string?`)
  - Instruct the LLM to return JSON matching `ProposedChange`
  - Include a literal example of the expected JSON
- Parse the bridge response as JSON
- If parsing fails, retry once with the parse error appended to the message
- If second attempt fails, throw with the raw response included in the error

**Why:** Each language agent has a tailored system prompt because different stacks have different idioms. A generic "write code" prompt produces generic code. The .NET prompt nudges the LLM toward idiomatic C# — the kind of code a senior .NET developer would write and approve. The JSON output format is required because `verification-layer.ts` needs structured data (filename, line numbers, explanation) — not free-form text. The retry on parse failure is a pragmatic reality: LLMs occasionally wrap JSON in markdown code fences or add commentary before the JSON object.

**Produces:** `dotnet-agent.ts` exports `DotnetAgent` implementing `LanguageAgent`. Calling `propose(step.body, bridge)` returns a `ProposedChange` object for a .NET code change.

---

### Step 3.1c — Implement `svelte-agent.ts`, `angular-agent.ts`, `blazor-agent.ts`

**What:** Create three more language agents following the same pattern as `dotnet-agent.ts`. Each has a different `stack` value and different system prompt guidance:

- `svelte-agent.ts`: stack=`'svelte'`. Prompt guidance: use Svelte 5 runes (`$state`, `$derived`, `$effect`), avoid legacy `$: reactive` statements, prefer `<script lang="ts">`, use SvelteKit conventions for routing/loading.
- `angular-agent.ts`: stack=`'angular'`. Prompt guidance: use signals (Angular 17+), use standalone components by default, use `inject()` function for dependency injection, avoid `ngModule` patterns in new code.
- `blazor-agent.ts`: stack=`'blazor'`. Prompt guidance: use `@rendermode InteractiveServer` for interactive components, prefer `EventCallback` over `Action` for component events, use `IJSRuntime` for JavaScript interop.

All three follow the same structure: `stack` property, `propose` method, JSON parsing, one retry.

**Why:** The four Phase 1 agents prove the extensibility principle. They are not special — they are four instances of the same pattern. A developer reading the codebase will immediately understand: "to add Python support, I copy one of these files, change the stack name, and update the system prompt." The language-specific guidance in each prompt is what makes CleanClaw's output higher quality than a generic "write code" tool — each agent knows the idioms of its stack.

**Produces:** Three more `.ts` files implementing `LanguageAgent`. Total Phase 1 agents: 4 (dotnet, svelte, angular, blazor).

---

### Step 3.2a — Implement `diff-capture.ts`

**What:** Replace `export {}` in `cleanclaw/plans/diff-capture.ts` with:
```typescript
export interface DiffCapture {
  filename: string;
  lines: { lineNumber: number; content: string }[];
  isNewFile: boolean;
}

export function captureBeforeState(filename: string, lineNumbers: number[]): DiffCapture {
  if (!fs.existsSync(filename)) {
    return { filename, lines: [], isNewFile: true };
  }
  const all = fs.readFileSync(filename, 'utf-8').split('\n');
  const lines = lineNumbers.map(n => ({
    lineNumber: n,
    content: all[n - 1] ?? '(line does not exist)',
  }));
  return { filename, lines, isNewFile: false };
}
```

**Why:** The diff capture reads the file's actual current state from disk — not what the LLM thinks the file contains. This is the "Before" in the approval display and the log entry. Reading it separately from the LLM's proposed change prevents a class of bug where the LLM "hallucinates" what the current file looks like. The `isNewFile: true` case handles files that do not exist yet — the Before state is genuinely empty, and the log should say so.

**Produces:** `diff-capture.ts` exports `captureBeforeState`. Calling it with a filename and line numbers returns the actual content of those lines from disk.

---

### Step 3.3a — Implement `verification-layer.ts`

**What:** Replace `export {}` in `cleanclaw/core/verification-layer.ts` with a function:
```typescript
export async function promptApproval(
  proposed: ProposedChange,
  before: DiffCapture,
): Promise<{ approved: boolean; why: string }> {
  console.log('\n--- PROPOSED CHANGE ---');
  console.log(`File: ${proposed.filename}`);
  console.log('\nBEFORE:');
  before.lines.forEach(l => console.log(`  ${l.lineNumber}: ${l.content}`));
  console.log('\nAFTER:');
  proposed.afterLines.forEach(l => console.log(`  ${l.lineNumber}: ${l.content}`));
  console.log(`\nExplanation: ${proposed.explanation}`);
  console.log('\nApprove? [y]es / [n]o / [s]kip task: ');

  const answer = await readLine();
  if (answer === 'n' || answer === 's') {
    return { approved: false, why: 'rejected' };
  }

  console.log(`Why are you approving this? (Enter to use agent explanation): `);
  const why = await readLine();
  return { approved: true, why: why.trim() || proposed.explanation };
}
```

Use `readline` from Node.js core for `readLine()` — no external dependency.

**Why:** The approval prompt is the core UX of CleanClaw. The Before/After display with line numbers is what lets the developer review changes as they happen. The WHY prompt is what populates the log file with human reasoning, not just "approved". The decision to default to the agent's explanation (if the user just presses Enter) reduces friction while still capturing the reason. Using `readline` from Node.js core is a deliberate choice to avoid adding a dependency — a CLI input library would be overkill for this.

**Produces:** `verification-layer.ts` exports `promptApproval`. Displays the change, gets user input, returns `{ approved, why }`.

---

### Step 3.4a — Implement `log-writer.ts`

**What:** Replace `export {}` in `cleanclaw/plans/log-writer.ts` with:
```typescript
export function appendLogEntry(
  taskId: string,
  variant: string,
  changeNumber: number,
  proposed: ProposedChange,
  before: DiffCapture,
  why: string,
  model: string,
  plansDir: string,
  logFormat: 'markdown' | 'json',
): void {
  const dir = path.join(plansDir, `task${taskId}`);
  const ext = logFormat === 'json' ? 'json' : 'md';
  const filename = `task${taskId}${variant}_log.${ext}`;
  const filepath = path.join(dir, filename);

  const entry = logFormat === 'json'
    ? formatLogEntryJson(changeNumber, proposed, before, why, model)
    : formatLogEntryMarkdown(changeNumber, proposed, before, why, model);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(filepath, entry, 'utf-8');
}
```

Implement both `formatLogEntryMarkdown` (existing format — `## Change N`, file name, Before/After sections, WHY, model name) and `formatLogEntryJson` (a JSON object with the same fields, serialised as a newline-delimited JSON record for easy parsing).

**Why:** The log file is append-only and never rewritten. `appendFileSync` is the right tool — it adds to the end of the file if it exists, or creates it if it doesn't. Using `writeFileSync` would overwrite previous entries, destroying the audit trail. The log file is the product's most important output — every design decision protects its integrity. Recording the model name in every entry means you can always trace which model produced which change. Supporting both `markdown` and `json` output lets power users pipe the log into their own tooling (grep, jq, dashboards) while keeping the default human-readable.

**Produces:** `log-writer.ts` exports `appendLogEntry`. Calling it appends a formatted log entry to `plans/task01/task01A_log.md` (markdown) or `plans/task01/task01A_log.json` (JSON) based on `config.logFormat`.

---

### Step 3.4b — Implement `markStepComplete` in `plan-writer.ts`

**What:** Add a function `markStepComplete(planPath: string, stepHeading: string, outputPath: string): void` to `cleanclaw/plans/plan-writer.ts`:
- On first call: read the source plan from `planPath`, write a copy to `outputPath`.
- On subsequent calls: read from `outputPath` (the working copy), not the original.
- Find the line matching `### Step X.Xa — <stepHeading>` (or already prefixed `[DONE] ### Step X.Xa — ...`).
- If the heading is found and not already prefixed, prepend `[DONE] ` to it and write the file back.
- If the heading is already `[DONE]`, leave it unchanged.
- If the heading is not found, log a warning to stderr and return without modifying the file.

**Why:** The completed plan copy gives the developer a live artefact they can open at any point during a run and see exactly which steps have been applied. It does not mutate the source plan — the original is the reference document. The `[DONE]` prefix is parsed by `parsePlanSteps` (Step 3.4c) to skip already-applied steps on resume. This is the mechanism that makes CleanClaw resumable: re-run after a crash and it picks up from the last uncompleted step.

**Produces:** `plan-writer.ts` exports `markStepComplete`. After a step is approved and logged, calling it creates or updates `outputPath` with the matching heading prefixed `[DONE]`.

---

### Step 3.4c — Implement `plan-parser.ts`

**What:** Create `cleanclaw/plans/plan-parser.ts` exporting:
```typescript
export interface PlanStep {
  heading: string;
  number: string;
  body: string;
}

export function parsePlanSteps(planMarkdown: string): PlanStep[] {
  // Split on ### Step N.Na — headings
  // Skip any heading already prefixed with [DONE]
  // Return { heading, number, body } per step
}
```

The regex to split on: `/^### (?!\[DONE\])Step (\d+\.\d+\w+) — /m`. Each match gives `number` (e.g. `3.4a`) and the rest of the line is the heading. Everything between this heading and the next `### Step` heading (or end of file) is `body`.

**Why:** The pipeline needs to iterate over plan steps programmatically — it cannot hard-code step numbers. `parsePlanSteps` turns the markdown plan into a list of `PlanStep` objects the pipeline can loop over. Skipping `[DONE]` headings at parse time means the pipeline automatically resumes from the first incomplete step, with no extra state file needed.

**Produces:** `plan-parser.ts` exports `parsePlanSteps`. Calling it with a plan markdown string returns an array of `PlanStep` objects for all non-completed steps.

---

### Step 3.5a — Wire approval into `pipeline.ts`

**What:** Update `runPipeline` in `cleanclaw/core/pipeline.ts` to:
1. After the planning step, resolve the language agent from config using `resolveLanguageAgent`
2. Use `parsePlanSteps` to parse the plan into steps — this skips any `[DONE]`-prefixed steps automatically
3. For each step in the parsed list, call `languageAgent.propose(step.body, bridge)`
4. After `propose()` returns, call `fs.existsSync(proposed.filename)`. If the file does not exist, prompt the user: `"WARNING: [filename] does not exist. This would create a new file. Confirm? [y/N]"`. If the user answers N: skip the step and log it as rejected. If Y: proceed with `isNewFile: true`.
5. Call `captureBeforeState` with the proposed filename and line numbers
6. Call `promptApproval` with the proposed change and before state
7. If approved: call `appendLogEntry` with the approval result, then call `markStepComplete(config.planPath, currentStepHeading, completedPlanPath)` to mark the step done in the working plan copy
8. If not approved: skip and log the rejection

Also update `agent-router.ts` to actually return a `LanguageAgent` based on `config.stack`:
```typescript
const agentMap: Record<string, LanguageAgent> = {
  dotnet: new DotnetAgent(),
  svelte: new SvelteAgent(),
  angular: new AngularAgent(),
  blazor: new BlazorAgent(),
};
```

**Why:** This is the step that connects all the components built in Weekends 1-3. The pipeline is where the sequence becomes real: plan → per-step language agent call → approval → log. The agent map in the router is a plain object lookup — dead simple, trivially extensible. To add Python: `python: new PythonAgent()`. Nothing else changes. The filename existence check protects against silent new-file creation — if CleanClaw is about to create a file the developer did not expect, they should be asked explicitly. File writes are in scope and intentional — CleanClaw is a coding agent that applies approved changes to source files on disk.

**Produces:** `pipeline.ts` updated to run the full Weekend 1-3 flow. `agent-router.ts` updated with a real language agent map. New-file creation requires explicit confirmation. Each approved step is marked `[DONE]` in the working plan copy.

---

### Step 3.6a — Smoke test Weekend 3

**What:** Create `test/smoke/weekend3-smoke.ts`:
- Hard-code a task description
- Run `runPipeline` with `.NET` stack config
- When the approval prompt appears, type `y` and press Enter
- Confirm `plans/task01/task01A_log.md` exists and contains the correct entry format

**Why:** The approval prompt is interactive — it requires a human in the loop. This smoke test confirms the entire flow works interactively before you add any further complexity in Weekend 4. The log file produced here is also the first real artefact you can show externally: "here is what CleanClaw produces when you run it."

**Produces:** An interactive approval session. `plans/task01/task01A_log.md` with at least one entry containing `## Change 1`, Before, After, and WHY sections.

---

## Weekend 4 — Diff Capture, Verification, and Full Pipeline Test

**Goal:** Full pipeline runs end to end with a real coding task. Diff capture reads actual file state. Unit tests for file I/O components.

---

### Step 4.1a — Harden `diff-capture.ts` for short files

**What:** Update `captureBeforeState` in `diff-capture.ts` to handle the case where the requested line number is greater than the file's total line count. Instead of returning `'(line does not exist)'`, return the actual last line of the file with a comment: `content: '(file ends at line N)'`.

**Why:** Language agents sometimes propose changes at line numbers that are near the end of a file. If the file has 50 lines and the agent proposes changing lines 48-52, lines 51-52 do not exist. Returning a clear annotation prevents the approval display from showing confusing empty or undefined values.

**Produces:** `diff-capture.ts` handles short files gracefully. No crashes on out-of-bounds line numbers.

---

### Step 4.1b — Harden `diff-capture.ts` for binary files

**What:** Add a check at the top of `captureBeforeState`: if the file extension is in a known binary list (`.png`, `.jpg`, `.gif`, `.exe`, `.dll`, `.wasm`, etc.), return a `DiffCapture` with `lines: []` and add a `warning` field: `'Binary file — diff skipped'`.

Update the `DiffCapture` interface to include `warning?: string`.

**Why:** If a language agent somehow proposes a change to a binary file (unlikely but possible), trying to read it as UTF-8 text will produce garbage characters or crash. Detecting and skipping binary files prevents this entire class of failure. The `warning` field lets the approval display and log writer show "Binary file — diff skipped" so the user knows what happened.

**Produces:** `DiffCapture` interface updated. `captureBeforeState` never crashes on binary files.

---

### Step 4.1c — Harden `diff-capture.ts` for encoding issues

**What:** Wrap the `fs.readFileSync` call in a try/catch. If it throws a `Buffer.toString` encoding error, catch it and return `DiffCapture` with `warning: 'Could not read file as UTF-8 — encoding unknown'`.

**Why:** Non-UTF-8 files (UTF-16, Latin-1, etc.) are uncommon in modern projects but do exist, especially in enterprise codebases. Crashing with an unhandled encoding error mid-approval would lose the user's session state. The try/catch here converts a crash into a handled, logged warning.

**Produces:** `diff-capture.ts` handles encoding errors without crashing.

---

### Step 4.2a — Implement the WHY override in `verification-layer.ts`

**What:** Update `promptApproval` to:
1. If the user types a non-empty WHY string, use it as-is
2. If the user presses Enter without typing, use `proposed.explanation` verbatim
3. Prepend a label: `'[agent] '` or `'[user] '` to the WHY string in the return value

**Why:** Distinguishing between "the WHY was the agent's explanation" and "the WHY was the developer's own words" is valuable in the audit log. An investor reading the log can see: "[agent] Added null check to prevent NullReferenceException" vs "[user] Required by ticket #1234 — never let this function return null". Both are valid reasons, but they mean different things. The label adds this context without changing the format.

**Produces:** `verification-layer.ts` returns WHY strings prefixed with `[agent]` or `[user]`. Log entries distinguish agent-generated reasons from user-written ones.

---

### Step 4.3a — Implement `variant-manager.ts`

**What:** Replace `export {}` in `cleanclaw/plans/variant-manager.ts` with:
```typescript
export function getNextVariant(taskId: string, plansDir: string): string {
  const taskDir = path.join(plansDir, `task${taskId}`);
  if (!fs.existsSync(taskDir)) return 'A';
  const files = fs.readdirSync(taskDir);
  const plans = files.filter(f => f.endsWith('_plan.md'));
  if (plans.length === 0) return 'A';
  const lastVariant = plans[plans.length - 1].charAt(taskId.length + 4); // e.g. task01A_plan.md → 'A'
  return String.fromCharCode(lastVariant.charCodeAt(0) + 1);
}
```

**Why:** Variants are lettered A, B, C... The variant manager reads the plans directory and returns the next letter. This is a pure file system lookup — no state needs to be tracked in memory. The variant system exists to handle scope changes mid-task: if a task grows beyond its original scope boundary, you start a new variant rather than editing the existing plan. This preserves the audit trail: plan A is what was originally agreed, plan B is what was done when scope changed.

**Produces:** `variant-manager.ts` exports `getNextVariant`. Returns `'A'` for a new task, `'B'` if plan A exists, `'C'` if plans A and B exist, etc.

---

### Step 4.4a — End-to-end real task test

**What:** Create a temp directory `test/e2e/temp-project/` with a single TypeScript file containing a simple function without input validation. Configure `cleanclaw.config.json` to point to this directory. Run `runPipeline` with task description "Add input validation to the processAge function". Follow the interactive approval. Confirm:
- `plans/task01/task01A_plan.md` exists
- `plans/task01/task01A_log.md` exists
- The log entry has the correct Before/After content (matching what was in the temp file)
- The WHY is populated

**Why:** Everything so far has been tested with hardcoded data or API mocks. This is the first test with a real file — a file that actually exists on disk, with actual content that `diff-capture.ts` reads. If the Before content in the log does not match the actual file content, there is a bug in `diff-capture.ts`. This test cannot be faked.

**Produces:** A complete plan + log pair in a real directory. The first genuine CleanClaw run against a real file.

---

### Step 4.5a — Implement `state-manager.ts`

**What:** Replace `export {}` in `cleanclaw/core/state-manager.ts` with:
```typescript
export interface CleanClawState {
  projectName: string;
  currentTaskId: string;
  currentVariant: string;
  plansDir: string;
  lastUpdated: string;
}

export function saveState(state: CleanClawState, projectDir: string): void {
  const filepath = path.join(projectDir, '.cleanclaw-state.json');
  fs.writeFileSync(filepath, JSON.stringify(state, null, 2), 'utf-8');
}

export function loadState(projectDir: string): CleanClawState | null {
  const filepath = path.join(projectDir, '.cleanclaw-state.json');
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as CleanClawState;
}
```

Add `.cleanclaw-state.json` to `.gitignore`.

**Why:** The state file is how the CLI (Weekend 6) knows where a project left off. When you run `cleanclaw status`, it reads this file. When you run `cleanclaw switch`, it saves this file for the current project before loading the target project's file. The state is per-project, stored in the project root, and never committed to git. It is purely a local "I was here" marker.

**Produces:** `state-manager.ts` exports `saveState` and `loadState`. `.cleanclaw-state.json` is added to `.gitignore`.

---

### Step 4.6a — Unit test `plan-writer.ts`

**What:** Create `cleanclaw/plans/plan-writer.test.ts` using vitest:
- Test 1: `writePlan` creates the file with correct content
- Test 2: `writePlan` throws if the file already exists
- Test 3: `writePlan` throws if the plan is missing `## Objective`
- Test 4: `writePlan` creates the `taskXX` directory if it does not exist

Use `tmp` or `os.tmpdir()` for temp directories. Always clean up in `afterEach`.

**Why:** These tests directly target the invariants that protect the audit trail. Test 2 is the most important: it proves that once a plan is written, it cannot be overwritten. Test 3 proves the format validation is active. Without these tests, a future code change could silently break these guarantees.

**Produces:** `plan-writer.test.ts` with four passing tests. Run with `npx vitest run`.

---

### Step 4.6b — Unit test `log-writer.ts`

**What:** Create `cleanclaw/plans/log-writer.test.ts`:
- Test 1: First call creates the file with one entry
- Test 2: Second call appends a second entry — file has both entries
- Test 3: Entry contains `## Change N`, `File:`, `BEFORE:`, `AFTER:`, `Why:`, `Model:`
- Test 4: Entries are in order (Change 1 before Change 2)

**Why:** The log file's value is in its completeness and ordering. Test 2 proves append behaviour — the most critical property. If `log-writer.ts` accidentally uses `writeFileSync` instead of `appendFileSync`, Test 2 catches it immediately.

**Produces:** `log-writer.test.ts` with four passing tests.

---

### Step 4.6c — Unit test `diff-capture.ts`

**What:** Create `cleanclaw/plans/diff-capture.test.ts`:
- Test 1: File does not exist → `isNewFile: true`, empty lines
- Test 2: File exists, request lines 1-3 → correct content returned
- Test 3: File has 5 lines, request line 10 → handles gracefully (no crash)
- Test 4: Binary file extension → returns warning, no crash

**Why:** `diff-capture.ts` is the component most likely to encounter edge cases in real projects: new files, files with fewer lines than expected, binary files. These tests verify the hardening from Steps 4.1a-4.1c is actually working, not just in theory.

**Produces:** `diff-capture.test.ts` with four passing tests.

---

## Weekend 5 — Multi-Provider, Config Merger, and Approval Granularity

**Goal:** Same task runs on Anthropic and OpenAI. Log structure identical. Approval granularity works.

---

### Step 5.1a — Implement `config-merger.ts`

**What:** Replace `export {}` in `cleanclaw/core/config-merger.ts` with:
```typescript
export function mergeConfigs(globalConfig: Partial<CleanClawConfig>, projectConfig: Partial<CleanClawConfig>): CleanClawConfig {
  return {
    ...globalConfig,
    ...projectConfig,
    anthropic: { ...globalConfig.anthropic, ...projectConfig.anthropic },
    openai: { ...globalConfig.openai, ...projectConfig.openai },
  } as CleanClawConfig;
}
```

Update `config-loader.ts` to:
1. Try reading `~/.cleanclaw/config.json` (global config)
2. Read `./cleanclaw.config.json` (project config)
3. Pass both to `mergeConfigs`
4. Return the merged result

**Why:** Global config (`~/.cleanclaw/config.json`) lets a developer set their API keys and default provider once, globally. Project config (`./cleanclaw.config.json`) overrides just what is project-specific (stack, plansDir, projectName). Without this merge, every project would need a full config including the API key — meaning the key is duplicated across projects, increasing the risk of it ending up in the wrong place. With the merge, global = credentials, project = project settings.

**Produces:** `config-merger.ts` exports `mergeConfigs`. `config-loader.ts` now reads from two locations and merges them.

---

### Step 5.2a — Add API key environment variable support

**What:** Update `config-loader.ts` validation step:
1. If `config.provider === 'anthropic'` and `config.anthropic?.apiKey` is missing, check `process.env.ANTHROPIC_API_KEY`
2. If the env var is set, use it to fill in the missing `apiKey`
3. If neither the config nor the env var has the key, throw: `'Anthropic API key not found. Set ANTHROPIC_API_KEY or add it to cleanclaw.config.json'`
4. Same logic for OpenAI: `OPENAI_API_KEY`

**Why:** Environment variables are the standard way to pass secrets in CI/CD pipelines and containerised environments. Developers using CleanClaw in GitHub Actions, Docker, or cloud environments will set secrets as env vars, not in config files. Supporting both means CleanClaw works in every environment without requiring config file changes. The error message is designed to be copy-pasteable documentation: it tells the user exactly what to do.

**Produces:** `config-loader.ts` reads API keys from env vars as a fallback. Clear error messages when neither source has the key.

---

### Step 5.3a — Harden `openai-bridge.ts` for error shapes

**What:** Update `OpenAiBridge.send()` to catch OpenAI API errors and rethrow with clean messages:
- 401 error → `'OpenAI authentication failed. Check your OPENAI_API_KEY.'`
- 429 error → `'OpenAI rate limit hit. Wait a moment and try again.'`
- Any other API error → `'OpenAI API error: [status] [message]'`

Use the `openai` SDK's error type: `import { APIError } from 'openai'`.

**Why:** Without this, an expired API key produces something like `OpenAIError: 401 Unauthorized { "error": { "message": "Incorrect API key provided..." } }` — technically informative but the stack trace is confusing for a new user. Catching and rethrowing with a plain English message means the error the user sees is immediately actionable: "Check your OPENAI_API_KEY." That is the kind of DX that generates positive word of mouth.

**Produces:** `openai-bridge.ts` with error handling. 401 and 429 produce clean, actionable error messages.

---

### Step 5.3b — Add `model` to `BridgeResponse` for both bridges

**What:** Verify that both `AnthropicBridge` and `OpenAiBridge` populate `response.model` in their `BridgeResponse`. For Anthropic this is already in `response.model` from the SDK. For OpenAI it is `completion.model`. Log-writer uses this field to record which model was used.

**Why:** `BridgeResponse.model` is not cosmetic — it is audit data. When you demo CleanClaw to an investor and the log shows `Model: claude-sonnet-4-5-20251022`, that is proof the tool is capturing provenance. When debugging a bad AI suggestion, knowing which model produced it is the first debugging step.

**Produces:** Both bridges correctly populate `model` in the response. Log entries always show which model was used.

---

### Step 5.4a — Implement approval granularity in `verification-layer.ts`

**What:** Add a `granularity` parameter to `promptApproval`:

| Granularity | Behaviour |
|---|---|
| `per-change` | Call `promptApproval` once per `ProposedChange` — the current default |
| `per-file` | Collect all `ProposedChange` objects for the same filename, display them all together, prompt once |
| `per-step` | Collect all `ProposedChange` objects for a single pipeline step, prompt once |

Implement `per-file` grouping in the pipeline layer: before calling `promptApproval`, group the step's proposed changes by `filename`. Pass the group to a new `promptApprovalForFile` overload.

**Why:** Approval granularity is a key config knob. `per-change` is most cautious but highest friction — every small change requires a keypress. `per-file` is a good default: you review everything touching a file at once, then approve or reject the file. `per-step` is for experienced users who trust the agent and want to move fast. Making this configurable means different team members can use different settings based on their risk tolerance.

**Produces:** `verification-layer.ts` respects the `approvalGranularity` config setting. All three granularity modes work correctly.

---

### Step 5.5a — Cross-provider smoke test

**What:** Run the same task description twice:
1. Set `provider: anthropic` in config. Run `runPipeline`. Save the resulting `task01A_log.md`.
2. Set `provider: openai` in config. Run `runPipeline` with a new task ID. Save the resulting `task02A_log.md`.

Open both log files. Verify:
- Both have the same headings: `## Change 1`, `File:`, `BEFORE:`, `AFTER:`, `Why:`, `Model:`
- `Model:` lines show different providers (`anthropic/claude-sonnet-4-5` vs `openai/gpt-4o`)
- The actual proposed code changes differ (expected — different models, different suggestions)

**Why:** "Provider agnostic" is a marketing claim. This smoke test turns it into a demonstrated fact. When you write the LinkedIn launch post saying "works with Claude and GPT-4", you have two log files in the repo as evidence. The identical structure also proves the bridge abstraction is working correctly.

**Produces:** Two log files demonstrating identical structure across providers. Evidence for the "provider agnostic" launch claim.

---

### Step 5.6a — Add model selection to `agent-router.ts`

**What:** Update `resolveBridge` in `agent-router.ts` to read the model from config with fallback defaults:
- Anthropic: `config.anthropic?.model ?? 'claude-sonnet-4-5'`
- OpenAI: `config.openai?.model ?? 'gpt-4o'`

Add a config option `anthropic.model` and `openai.model` to the `CleanClawConfig` interface if not already present.

**Why:** Power users will want to specify models. A .NET team might want to use Claude Sonnet for plan generation and Claude Haiku for language agent calls (cheaper, faster). An OpenAI user might want to use `gpt-4o-mini` for cost savings. Exposing model selection in config lets users tune this without code changes. The default values mean it "just works" out of the box.

**Produces:** `agent-router.ts` reads model from config. `CleanClawConfig` has `model` fields. Users can configure the model per provider.

---

## Weekend 6 — CLI, Project Switching, and Install Script

**Goal:** `cleanclaw` command works from anywhere. Project switching saves and restores context.

---

### Step 6.1a — Implement the CLI entry point `bin/cleanclaw.js`

**What:** Replace the stub in `bin/cleanclaw.js` with a full Commander.js setup:
```javascript
#!/usr/bin/env node
import { program } from 'commander';
program
  .command('init').description('Initialise a project').action(...)
  .command('run <task>').description('Run a task').action(...)
  .command('switch <project>').description('Switch active project').action(...)
  .command('status').description('Show current project status').action(...)
  .command('help').description('Show help')
  .parse();
```

Each action imports from the compiled `cleanclaw/cli/` TypeScript (compiled to JS via `tsc`).

**Why:** Commander.js is already in `package.json` from NemoClaw. It parses `process.argv` and routes to the correct handler. The alternative — writing your own arg parser — is a maintenance trap. Commander.js handles `--help`, `--version`, argument validation, and sub-command routing out of the box.

**Produces:** `bin/cleanclaw.js` with five commands wired up. `node bin/cleanclaw.js --help` shows the command list.

---

### Step 6.2a — Implement `cleanclaw init` in `setup-wizard.ts`

**What:** Replace `export {}` in `cleanclaw/cli/setup-wizard.ts` with a function that runs an interactive prompt sequence using `readline`:
1. "Project name: " → validates non-empty
2. "Provider (anthropic/openai) [anthropic]: " → defaults to anthropic
3. "API key (or press Enter if using env var): " → optional
4. "Approval granularity (per-change/per-file/per-step) [per-file]: " → defaults to per-file
5. "Stack (dotnet/svelte/angular/blazor) [dotnet]: " → defaults to dotnet

Writes `cleanclaw.config.json` in the current directory. Creates `./plans/`. Writes initial `.cleanclaw-state.json`.

**Why:** `init` is the first command a new user runs. The wizard format (questions one at a time, defaults shown in brackets, Enter to accept default) is the standard pattern for CLI setup tools (think `npm init`, `create-react-app`). It is more discoverable than a blank config file and less intimidating than reading the full config schema. Every question has a working default so a user who presses Enter five times gets a working configuration.

**Produces:** `cleanclaw.config.json` in the current directory. `./plans/` directory. `.cleanclaw-state.json` with initial state.

---

### Step 6.3a — Implement `cleanclaw run` in `run-workflow.ts`

**What:** Replace `export {}` in `cleanclaw/cli/run-workflow.ts` with a function that:
1. Loads config with `loadConfig()`
2. Loads state with `loadState(process.cwd())`
3. Determines the next task ID from existing plan files
4. Calls `runPipeline(taskDescription, config)`
5. Saves updated state with `saveState()`

**Why:** The `run` command is the day-to-day usage path. Its job is thin: load context, run the pipeline, save updated state. It should not contain pipeline logic — that stays in `pipeline.ts`. The state save after running ensures `cleanclaw status` always reflects the last thing that was done.

**Produces:** `run-workflow.ts` exports a `runWorkflow(taskDescription: string)` function. `cleanclaw run "Add a login function"` works end to end.

---

### Step 6.4a — Complete `state-manager.ts` save/load

**What:** Update `state-manager.ts` to also read and write a global state file:
```typescript
export function getGlobalStateDir(): string {
  return path.join(os.homedir(), '.cleanclaw');
}

export function saveActiveProject(projectDir: string): void {
  const dir = getGlobalStateDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'active-project.json'), JSON.stringify({ projectDir }, null, 2));
}

export function loadActiveProject(): string | null {
  const filepath = path.join(getGlobalStateDir(), 'active-project.json');
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')).projectDir;
}
```

**Why:** The global state file (`~/.cleanclaw/active-project.json`) is how `cleanclaw switch` and `cleanclaw status` know which project is currently active. Without it, `cleanclaw status` would have to guess based on the current directory — which breaks if you run the command from a different terminal or directory. The global file is the single source of truth for "which project am I working in right now".

**Produces:** `state-manager.ts` exports `saveActiveProject` and `loadActiveProject`. The global state directory (`~/.cleanclaw/`) is created automatically.

---

### Step 6.5a — Implement `cleanclaw switch`

**What:** Add a `switch` handler to the CLI that:
1. Takes a project name or directory path
2. Saves the current project state with `saveActiveProject`
3. Validates the target project exists (has `cleanclaw.config.json`)
4. Loads the target project's state with `loadState`
5. Prints: "Switched to [project name]. Last task: task03B."

**Why:** Developers work on multiple projects. `cleanclaw switch` lets you move between them without navigating directories. The state save before switching means when you come back to the previous project, `cleanclaw status` shows the correct last task. The validation step (check for `cleanclaw.config.json`) prevents switching to a directory that was never initialised with `cleanclaw init`, which would leave the user in a broken state.

**Produces:** `cleanclaw switch <path>` works. State is saved and restored. Confirmation message shows project name and last task.

---

### Step 6.6a — Write `install.sh`

**What:** Create or update `install.sh`:
```bash
#!/usr/bin/env bash
set -e

echo "CleanClaw installer"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 22 ]; then
  echo "Error: Node.js 22+ required. Install with: fnm install 22"
  exit 1
fi

# Install dependencies
npm install

# Create symlink on PATH
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
chmod +x "$SCRIPT_DIR/bin/cleanclaw.js"
ln -sf "$SCRIPT_DIR/bin/cleanclaw.js" "$HOME/.local/bin/cleanclaw"

echo "CleanClaw installed. Run: cleanclaw init"
```

**Why:** The install script is the first thing a new user runs. It must fail fast and clearly if Node.js is the wrong version — before wasting time on `npm install`. The symlink to `~/.local/bin/cleanclaw` puts the command on PATH without requiring `sudo`. `~/.local/bin` is the standard user-local binary directory on Linux/WSL2. The script uses `set -e` so any error exits immediately rather than continuing to a broken state.

**Produces:** `install.sh` in the repo root. After running it, `cleanclaw --help` works from any directory.

---

### Step 6.7a — CLI smoke test: `init` and `run`

**What:** Create a temp directory outside the repo. From inside it:
1. `node /path/to/cleanclaw/bin/cleanclaw.js init` — fill in the wizard
2. Confirm `cleanclaw.config.json` and `./plans/` were created
3. `cleanclaw run "Add a hello world function"` — follow the approval
4. Confirm `./plans/task01/task01A_plan.md` and `task01A_log.md` exist

**Why:** The CLI smoke test runs from a directory with no relationship to the CleanClaw repo. This simulates a real user who installed the tool and is using it in their own project. If the relative paths in `config-loader.ts` are wrong (e.g. they resolve relative to the repo root instead of the user's current directory), this test catches it.

**Produces:** Full CLI smoke test passed from an external directory. CleanClaw works as a standalone installed tool.

---

### Step 6.7b — CLI smoke test: `switch` and `status`

**What:** From the same temp directory:
1. Create a second temp directory and run `cleanclaw init` in it
2. Run `cleanclaw switch <path-to-second-dir>` from the first
3. Run `cleanclaw status` — confirm it shows the second project
4. Run `cleanclaw switch <path-to-first-dir>` — confirm status returns to the first project

**Why:** Project switching is a feature that is hard to test without actually having two projects. This two-project test verifies that switching saves and restores state correctly, and that `status` reads from the global state file (not the current directory).

**Produces:** Project switching works across two external directories. Global state file correctly tracks active project.

---

## Weekend 7 — Polish, Testing, and Launch

**Goal:** Real developers can install and use CleanClaw. GitHub repo is public. Launch posts are live.

---

### Step 7.1a — Complete `setup-wizard.ts` with first-run detection

**What:** Update `setup-wizard.ts` to:
1. Check if `~/.cleanclaw/config.json` exists
2. If not, run the global config wizard (provider, API key, default granularity)
3. Write `~/.cleanclaw/config.json`
4. Offer: "Would you like to initialise your first project now? [y/n]"
5. If yes, run the project init flow in the current directory

**Why:** First-run detection prevents the wizard from running twice if a user runs `cleanclaw init` in a second project. The global config is written once. Project configs are written per-project. Offering to init immediately after global setup reduces friction: the user does not need to read the docs to know the next step.

**Produces:** First-run experience for a brand new machine: global config written, project config optionally created, user is ready to run their first task.

---

### Step 7.2a — Write integration tests for `.NET` and `Svelte` stacks

**What:** Create `test/e2e/dotnet.test.ts` and `test/e2e/svelte.test.ts`. Each test:
1. Mocks the `Bridge` (returns pre-written JSON matching `ProposedChange` — no live API calls)
2. Creates a temp directory with a sample file
3. Runs `runPipeline` with the mocked bridge
4. Auto-approves (mock the `promptApproval` to return `{ approved: true, why: '[test]' }`)
5. Asserts that plan and log files exist and have correct format

**Why:** Integration tests at this level prove the full pipeline works for each stack without requiring a live API key. This makes them suitable for CI — they can run on every pull request without burning API credits. The mock bridge returns a valid `ProposedChange` JSON directly, bypassing the LLM, so the test is deterministic: the same output every time, fast, and free.

**Produces:** Two integration tests that pass reliably in CI. `npx vitest run test/e2e/dotnet.test.ts` passes without an API key.

---

### Step 7.2b — Write integration tests for `Angular` and `Blazor` stacks

**What:** Same pattern as Step 7.2a for `angular.test.ts` and `blazor.test.ts`.

**Why:** Four tests, four stacks — the Phase 1 proof of concept is complete. Each test independently confirms that `agent-router.ts` correctly resolves the stack, the language agent's `propose` method is called, and the log file records the correct stack-specific context.

**Produces:** Four total e2e integration tests, one per Phase 1 stack, all passing in CI.

---

### Step 7.3a — Write the README

**What:** Create `README.md` in the repo root. Required sections:
1. **What CleanClaw is** — one paragraph, no jargon: "CleanClaw is a command-line tool that adds a human approval step to AI-assisted code changes. Every change proposed by an AI is shown to the developer as a Before/After diff. When approved, the change and the developer's reasoning are logged to a markdown file in your project."
2. **Prerequisites** — Node.js 22+, an Anthropic or OpenAI API key
3. **Install** — one command: `curl ... | bash` or `npm install -g cleanclaw`
4. **First run** — three commands: `cleanclaw init`, `cleanclaw run "your task"`, check `./plans/`
5. **Config reference** — table of all `CleanClawConfig` fields with descriptions
6. **Approval granularity** — explain per-change, per-file, per-step with examples
7. **Plan and log file format** — show example files
8. **Supported stacks** — .NET, Svelte, Angular, Blazor, with a note: "Adding a new language is one file"
9. **Contributing** — link to CONTRIBUTING.md

**Why:** The README is the product's homepage on GitHub. A developer who lands on the repo and cannot figure out what it does in 30 seconds will leave. The structure here mirrors the "Jobs to Be Done" of each reader: "What is it?" → "Can I use it?" → "How do I start?" → "How do I configure it?" → "How do I understand what it produces?" Every section serves a specific type of reader.

**Produces:** `README.md` that explains CleanClaw clearly and gets a new user running in under 5 minutes.

---

### Step 7.4a — Record the screen capture demo

**What:** Install `asciinema` in WSL2: `sudo apt install asciinema`. Then:
```bash
asciinema rec demo.cast
```
Run:
1. `cleanclaw init` — complete the wizard with real answers
2. `cleanclaw run "Add input validation to the login function"` — approve the proposed change
3. `cat plans/task01/task01A_plan.md` — show the plan
4. `cat plans/task01/task01A_log.md` — show the log

Stop recording: Ctrl+D. Convert to GIF: `agg demo.cast demo.gif`. Embed in README: `![CleanClaw demo](demo.gif)`.

**Why:** A GIF in the README is worth more than any amount of prose. A developer who sees the approval prompt fire with a real Before/After diff immediately understands what CleanClaw is and why it exists. They do not need to read the explanation paragraph. This is the single most impactful item in the launch package — do not skip it.

**Produces:** `demo.gif` embedded in `README.md`. The first thing visitors see on the GitHub page is CleanClaw working.

---

### Step 7.5a — Verify licence and update `CONTRIBUTING.md`

**What:**
1. Verify `LICENSE` file contains Apache 2.0 text (already present from NemoClaw)
2. Rewrite `CONTRIBUTING.md` for CleanClaw: how to add a language agent, how to run tests, how to submit a PR
3. Add GitHub issue templates in `.github/ISSUE_TEMPLATE/`:
   - `bug_report.md` — standard bug report template
   - `feature_request.md` — standard feature request template
   - `real_usage_report.md` — custom: "Tell us how you used CleanClaw for real work" (stack, team size, what task, what you thought)

**Why:** The "real usage report" issue template is seed raise evidence collection. If a developer files one of these issues, it is a signal that CleanClaw has real traction. The template asks for stack and team size, which are exactly the investor data points needed: "38 reports filed, 60% .NET teams, 25% Node/TypeScript, average team size 5." You cannot collect this data without building the collection mechanism before launch.

**Produces:** `LICENSE` confirmed Apache 2.0. `CONTRIBUTING.md` updated. Three issue templates in `.github/ISSUE_TEMPLATE/`.

---

### Step 7.5b — Tag v0.1.0 and make the repository public

**What:**
```bash
git tag v0.1.0
git push origin v0.1.0
```

Then go to GitHub repo Settings → Change visibility → Make public.

**Why:** The `v0.1.0` tag marks the launch point in git history. It is the version number in the README, the install script, and the launch posts. GitHub displays tags as releases — creating the tag makes the "Releases" section on the repo page show `v0.1.0`, which makes the project look more mature and trustworthy to first-time visitors. Making it public is the point of no return: from this moment, everything is visible.

**Produces:** `v0.1.0` tag in git history. Repository is public. GitHub Releases page shows v0.1.0.

---

### Step 7.6a — Write and publish the LinkedIn article

**What:** Write a 600-800 word LinkedIn article: "Why I built an AI audit trail for developers (and what I learned in 7 weekends)". Structure:
- Opening: the specific problem (AI suggests code, you press accept, six months later nobody knows why that code is there)
- Solution: CleanClaw's Before/After + WHY log
- 7 weekends summary: what was hardest, what surprised you
- Closing: GitHub link, call for feedback

Publish on Monday morning UK time.

**Why:** LinkedIn is the best channel for reaching engineering leads and CTOs — exactly the people who would pay for a managed version of CleanClaw. The personal story ("I built this in 7 weekends") is more engaging than a product announcement. The mention of "7 weekends" also signals it is a real, working product — not a concept.

**Produces:** LinkedIn article published. Backlink to the GitHub repo. Early signal on whether the target audience resonates with the positioning.

---

### Step 7.6b — Post to Reddit and Hacker News

**What:**
- Reddit `/r/programming` or `/r/devtools`: "I built a tool that logs every AI-suggested code change with before/after diffs and requires human approval. Here's what real usage looks like." — include the demo GIF and two example log file snippets.
- Hacker News Show HN: "Show HN: CleanClaw — audit trail and human approval layer for AI-assisted development" — keep it factual, link to GitHub, mention the two supported providers.

Post both at the same time as the LinkedIn article, Monday morning UK time.

**Why:** Reddit and Hacker News have audiences that are skeptical of AI hype and will engage seriously with a well-reasoned technical tool. The demo GIF is critical on Reddit — posts with GIFs get significantly more upvotes in dev communities. The HN Show HN format is well-understood: technical, factual, no marketing language. Getting to the HN front page even briefly can generate hundreds of GitHub stars in hours.

**Produces:** Two posts live on launch day. Early signal on community reception and positioning.

---

### Step 7.7a — Set up GitHub Discussions for feedback collection

**What:**
1. Go to repo Settings → Features → enable Discussions
2. Create category: "Real Usage Reports"
3. Pin a post: "Did you use CleanClaw for real work? Tell us what happened." Include prompts: which stack, which team size, which task, what you thought of the approval flow
4. Create category: "Ideas" — for feature requests that are longer than an issue

**Why:** GitHub Discussions is the right venue for open-ended feedback, as opposed to Issues which are for bugs and feature requests. "Real usage reports" give you the investor evidence you need: you can show a list of Discussions threads where developers describe using CleanClaw on real projects. The pinned post makes it easy for users to find the "right place" to leave feedback even if they are not sure whether to file an issue or a discussion.

**Produces:** GitHub Discussions enabled with "Real Usage Reports" and "Ideas" categories. Pinned post live. Feedback collection mechanism active from Day 1 of launch.

---

## Summary

| Phase | Steps | Milestone |
|---|---|---|
| Environment (E1-E9) | 9 | WSL2 working, repo renamed, stub committed |
| Weekend 1 | 10 | Live Anthropic API call through bridge |
| Weekend 2 | 7 | Plan file produced end to end |
| Weekend 3 | 8 | Approval + log file working interactively |
| Weekend 4 | 10 | Full hardened pipeline, unit tests |
| Weekend 5 | 7 | Multi-provider, approval granularity |
| Weekend 6 | 8 | CLI working from any directory |
| Weekend 7 | 9 | Launch live, feedback collection active |
| **Total** | **68** | |

---

## Code Style Constraints (For All Implementing Agents)

- Write simple, readable code. Prefer direct logic over clever abstractions.
- Do not introduce utility abstractions (pipelines, group maps, chained projections) unless there is a demonstrated need.
- One logical change per step — no bundling.
- All new TypeScript is ESM (`.js` extensions in imports, `"type": "module"` in package.json).
- No `any` types. Prefer explicit interfaces.
- No external dependencies beyond `@anthropic-ai/sdk`, `openai`, and `commander`. Node.js built-ins only for everything else.
