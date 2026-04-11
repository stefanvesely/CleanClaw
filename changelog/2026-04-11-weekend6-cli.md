# 2026-04-11 — Weekend 6 CLI Commands + Project Switching

## What changed

### bin/cleanclaw.js
- Replaced stub with full Commander.js CLI
- Four commands: `init`, `run <task>`, `switch <project>`, `status`
- Dynamic imports per command so only the relevant handler loads
- `commander` added to root `package.json` dependencies

### cleanclaw/cli/setup-wizard.ts
- Interactive readline wizard: project name, provider, API key, granularity, stack
- Writes `cleanclaw.config.json`, creates `./plans/`, saves initial `.cleanclaw-state.json`
- All fields have sensible defaults (anthropic, per-file, dotnet)

### cleanclaw/cli/run-workflow.ts
- `runWorkflow(taskDescription)`: load config → run pipeline → save updated state
- Thin wrapper — pipeline logic stays in `pipeline.ts`

### cleanclaw/cli/switch-project.ts
- Validates target directory has `cleanclaw.config.json`
- Calls `saveActiveProject` and prints confirmation with last task

### cleanclaw/cli/show-status.ts
- Reads from `loadActiveProject()` (global state) or falls back to `process.cwd()`
- Displays project name, directory, last task, plans dir, last updated

### cleanclaw/core/state-manager.ts
- Added `getGlobalStateDir()` → `~/.cleanclaw/`
- Added `saveActiveProject(projectDir)` and `loadActiveProject()`
- Global state file: `~/.cleanclaw/active-project.json`

### scripts/cleanclaw-install.sh
- Node.js 22+ check with actionable error
- `npm install` + symlink to `~/.local/bin/cleanclaw`
- PATH hint included in output
- Named `cleanclaw-install.sh` to avoid conflicting with NemoClaw's `install.sh`

## Result
Weekend 6 milestone: PASS — CLI wired up, state-manager global tracking working, project switching verified.

## Next
Weekend 7 — polish, testing, and launch.
