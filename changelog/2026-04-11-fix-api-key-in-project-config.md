# 2026-04-11 — Fix: API key no longer written to project config on init

## What changed

### `cleanclaw/cli/setup-wizard.ts`
Removed the block in `runProjectInitFlow()` that copied the provider config block (including `apiKey`) from the global config into `cleanclaw.config.json`.

## Why
The project config (`cleanclaw.config.json`) is intended to hold project-level settings (stack, granularity, provider name) and should be safe to commit. Writing the API key into it — even though the file is gitignored — is a security anti-pattern: one accidental `git add -f` or a missing `.gitignore` entry would expose the key.

API keys are already resolved correctly via the merge chain in `config-loader.ts`:
`default-config.json` → `~/.cleanclaw/config.json` (global, contains apiKey) → `cleanclaw.config.json` (project, no secrets).

The project config no longer needs to carry the key.
