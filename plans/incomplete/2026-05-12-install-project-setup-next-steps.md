# Install And Project Setup Next Steps

Created: 2026-05-12T19:46:59+02:00
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

- [ ] Project directory request and persistence.
  - Prompt for the project directory at install/project setup time.
  - Validate that the directory exists and is writable.
  - Persist it as the active CleanClaw project root.
  - Show the selected directory before writing config.
- [ ] Stack inference.
  - Inspect project files to infer stack instead of asking first.
  - Use signals such as solution/project files, package manifests, lockfiles, framework config, source extensions, Dockerfiles, and common folder names.
  - Show the inferred stack with confidence and allow override.
  - Store the inferred stack in `cleanclaw.config.json`.
- [ ] Numbered setup menus.
  - Replace typed provider, stack, embedding, and approval-mode options with numbered selections.
  - Keep direct typed fallback for advanced users, but make numbers the primary path.
  - Validate out-of-range numbers with a friendly retry.
- [ ] Automatic local embeddings.
  - Default to local embeddings without asking for a model name.
  - Ensure the local embedding package/model is available during setup.
  - Download/cache the default local model automatically when needed.
  - Keep provider/model override available in advanced config only.
- [ ] Coding-agent style command surface.
  - Add a default command or shell alias/wrapper so users do not need to type `cleanclaw run ...` every time.
  - Consider commands such as `cc`, `claw`, or an interactive `cleanclaw` REPL/task loop.
  - Preserve explicit `cleanclaw init`, `cleanclaw run`, and `cleanclaw status` for scripts and docs.
- [ ] Add at least 10 more stack agents.
  - Candidate stack agents: React, Next.js, Vue, Nuxt, Node/Express, Python/FastAPI, Python/Django, Java/Spring, Go, Rust, PHP/Laravel, Ruby/Rails, Flutter, React Native.
  - Each agent should include stack detection signals, planning guidance, file-scope heuristics, and implementation guardrails.
  - Add tests for stack inference and agent routing.
- [ ] Setup UX validation.
  - Add scripted tests for setup prompts using numbered selections.
  - Add tests for stack inference fixtures.
  - Add a local setup smoke test covering project directory selection, inferred stack, local embeddings, and first task run.

## Validation Plan

- Run focused setup-wizard tests for numbered menus and directory selection.
- Run stack inference fixture tests for each supported stack.
- Run `npm run build:cleanclaw`.
- Run `cleanclaw init` in a temporary sample project.
- Run a smoke task through the new coding-agent style entrypoint.

## Release Gate

- Do not mark this plan complete until the README is updated again with the new setup flow and the new command surface.
