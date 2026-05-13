# Install And Project Setup Next Steps

Created: 2026-05-12T19:46:59+02:00
Updated: 2026-05-13T00:00:00+02:00
Status: Incomplete

## Goal

Make CleanClaw feel like a coding agent that can be installed once, attached to a project, and then used naturally without repeatedly typing `cleanclaw ...` commands.

## Assumptions

- CleanClaw should infer project context from the selected project directory before asking stack questions.
- Setup should favor numbered menus over typed free-form option names.
- Local embeddings should be the default and should install/use a local model automatically without asking the user for a model name.
- The setup flow must explicitly request the project directory and persist it as the active project root.
- Agent selection should broaden beyond the current handful of stack agents.

## Incomplete Work

### Phase 1 - Project Root As First-Class State

- [ ] Prompt for the project directory at install/project setup time before provider/stack questions.
- [ ] Accept absolute paths, `~`, `.`, and relative paths resolved from the current shell directory.
- [ ] Validate that the selected directory exists, is a directory, and is writable.
- [ ] Detect likely project roots from common markers (`.git`, solution/project files, package manifests, lockfiles, framework configs).
- [ ] Show the selected directory and detected markers before writing config.
- [ ] Persist the active root in `cleanclaw.config.json` and the existing active-project state store.
- [ ] Add a `cleanclaw project` or `cleanclaw attach` flow for changing the active root later.

Implementation targets:

- `cleanclaw/cli/setup-wizard.ts`
- `cleanclaw/core/state-manager.ts`
- `cleanclaw/config/config-schema.ts`
- setup wizard tests and active project state tests

### Phase 2 - Stack Inference Before Stack Questions

- [ ] Add a stack inference module that scores project signals.
- [ ] Infer stack from files such as `.sln`, `.csproj`, `package.json`, lockfiles, `next.config.*`, `nuxt.config.*`, `vite.config.*`, `angular.json`, `requirements.txt`, `pyproject.toml`, `manage.py`, `pom.xml`, `build.gradle`, `go.mod`, `Cargo.toml`, `composer.json`, `Gemfile`, Flutter manifests, and React Native config.
- [ ] Return ranked candidates with confidence, detected evidence, and ambiguity notes.
- [ ] Show the best guess in setup and allow numbered override.
- [ ] Store the selected/inferred stack in `cleanclaw.config.json`.
- [ ] Add fixtures for single-stack and mixed-stack projects.

Implementation targets:

- new `cleanclaw/core/stack-inference.ts`
- `cleanclaw/core/agent-router.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `cleanclaw/core/stack-inference.test.ts`

### Phase 3 - Numbered Setup Menus

- [ ] Create a reusable numbered-choice prompt helper.
- [ ] Use numbered menus for provider, stack override, embedding provider, approval mode, and command-surface choice.
- [ ] Keep typed advanced fallback by accepting exact option ids.
- [ ] Validate out-of-range numbers, blank values, and unknown text with a friendly retry.
- [ ] Make defaults obvious and allow pressing Enter for the recommended choice.
- [ ] Ensure menus render cleanly in PowerShell/cmd and POSIX shells.

Implementation targets:

- new `cleanclaw/cli/numbered-prompt.ts`
- `cleanclaw/cli/setup-wizard.ts`
- prompt unit tests with scripted stdin

### Phase 4 - Automatic Local Embeddings

- [ ] Make local embeddings the default non-advanced setup path.
- [ ] Stop asking for a model name during normal setup.
- [ ] Define a single default local embedding model and cache directory.
- [ ] Detect whether the local embedding package/model is already available.
- [ ] Download/cache the default local model automatically when needed.
- [ ] Report progress and recovery guidance when model download fails.
- [ ] Keep provider/model override behind advanced config.

Implementation targets:

- `cleanclaw/projectmap/embedder.ts`
- `cleanclaw/cli/setup-wizard.ts`
- config schema/default config
- tests for default local embedding config and model bootstrap behavior

### Phase 5 - Coding-Agent Style Command Surface

- [ ] Add a natural default command flow so a user can run CleanClaw from an attached project without repeatedly typing `cleanclaw run ...`.
- [ ] Prefer a short alias command such as `claw` or `cc` if package/bin constraints allow it.
- [ ] Add an interactive task loop for `cleanclaw` with no subcommand when a project is already attached.
- [ ] Preserve explicit `cleanclaw init`, `cleanclaw run`, and `cleanclaw status` for scripts and docs.
- [ ] Make the command surface show the active project root and selected stack before starting a task.
- [ ] Ensure non-interactive shells still fail clearly instead of hanging for input.

Implementation targets:

- `bin/cleanclaw.js`
- package `bin` entries
- `cleanclaw/cli/run-workflow.ts`
- README command examples
- CLI dispatch tests

### Phase 6 - Add 10+ Stack Agents

- [ ] Add stack agents for React, Next.js, Vue, Nuxt, Node/Express, Python/FastAPI, Python/Django, Java/Spring, Go, Rust, PHP/Laravel, Ruby/Rails, Flutter, and React Native.
- [ ] Each agent should define planning guidance, file-scope heuristics, implementation guardrails, and test expectations.
- [ ] Route inferred stack ids to the correct language agent.
- [ ] Keep a generic fallback only for unsupported or ambiguous stacks.
- [ ] Add agent routing tests for every new stack.

Implementation targets:

- `cleanclaw/agents/*`
- `cleanclaw/core/agent-router.ts`
- `cleanclaw/core/language-agent.ts`
- stack inference fixtures and routing tests

### Phase 7 - Setup UX And Smoke Validation

- [ ] Add scripted tests for directory selection, numbered menus, stack inference, local embedding defaults, and first task handoff.
- [ ] Run `npm run build:cleanclaw`.
- [ ] Run `cleanclaw init` in a temporary sample project.
- [ ] Run a smoke task through the new coding-agent style entrypoint.
- [ ] Update README with the final setup flow and command surface.
- [ ] Add improvement-ticket guidance near the README top before release notes.

## Implementation Order

1. Project root prompt/persistence.
2. Stack inference module and fixtures.
3. Numbered prompt helper and setup wizard conversion.
4. Local embedding bootstrap defaults.
5. Coding-agent command surface.
6. Expanded stack agents and routing.
7. README, smoke tests, and release gate.

## Acceptance Criteria

- A fresh user can install/run setup, choose a project directory, accept an inferred stack, accept local embeddings, and start a task without manually editing config.
- Normal setup uses numbered menus; typed ids still work for advanced users.
- The selected project root, stack, provider, approval mode, and embedding settings persist.
- `cleanclaw` or a short alias can start a task loop for the active project without requiring `cleanclaw run ...` every time.
- At least 10 new stack agents are routed by inference and covered by tests.
- README documents the new flow and includes the requested test-project/improvement-ticket note.

## Validation Plan

- Run focused setup-wizard tests for numbered menus and directory selection.
- Run stack inference fixture tests for each supported stack.
- Run `npm run build:cleanclaw`.
- Run `cleanclaw init` in a temporary sample project.
- Run a smoke task through the new coding-agent style entrypoint.

## Release Gate

- Do not mark this plan complete until the README is updated again with the new setup flow and the new command surface.
