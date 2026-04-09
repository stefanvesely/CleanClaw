# CleanClaw Phase 1 — Plan Finalised

**Date:** 2026-04-02
**Author:** Stefan Vesely

## What Was Planned

Phase 1 of CleanClaw: a 7-weekend build plan to deliver a working, open-source AI code review CLI tool launched on GitHub, with evidence collected for a seed raise.

### Architecture Decision

CleanClaw runs as a standalone TypeScript CLI tool — it does NOT run inside NemoClaw's sandbox. NemoClaw's infrastructure files (`src/lib/`) are left untouched. CleanClaw's source lives in `src/cleanclaw/`. It runs on top of Nemoclaw using what is currently built.

### Stack

- Runtime: Node.js 22+ (ESM, TypeScript)
- AI: Anthropic Claude SDK (claude-sonnet-4-5 as default)
- CLI: Commander.js
- Testing: Vitest
- Environment: WSL2 (Ubuntu 24.04 LTS)

### Weekend Plan Summary

| Weekend | Focus |
|---------|-------|
| Pre-work | WSL2 setup, Node/npm, clone repo, `.env` with API key |
| 1 | Core engine — diff reader, prompt builder, Claude API call, JSON output |
| 2 | CLI interface — Commander.js, `review` and `config` commands, output formatting |
| 3 | Severity filtering, `--since` flag, multiple file support |
| 4 | Config file (`.cleanclawrc`), custom rules, GitHub Actions integration |
| 5 | Quality polish — test coverage, error handling, CI/CD |

## Why

- Demonstrates AI tooling capability
- Produces a real open-source artefact with measurable traction (stars, installs, issues)
- Fills a genuine gap: lightweight, zero-config AI code review that works in any CI pipeline

## Status

Plan approved and locked. Ready to begin pre-work (WSL2 setup).
