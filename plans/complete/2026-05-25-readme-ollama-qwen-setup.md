# README Ollama Qwen Setup

Created: 2026-05-25 22:10
Status: Complete
Completed: 2026-05-25 22:11

## Why

New CleanClaw users need a clear path for attaching a local coding LLM. Ollama with `qwen3-coder:30b` is the current recommended manual setup path until CleanClaw automates first-run model installation.

## Assumptions

- Do not claim the coding model is bundled with CleanClaw.
- Keep the steps Windows/PowerShell friendly.
- Explain that the 30B model is large and the user may need a smaller model if hardware is limited.

## Checklist

- [x] Add Ollama local coding model setup steps to README.
- [x] Include install, version check, model run, API test, and CleanClaw config direction.
- [x] Add changelog entry.
- [x] Run docs-safe validation.

## Validation Performed

- Passed: `rg -n "qwen3-coder|ollama run|ollama-local|Local coding model with Ollama" README.md`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run `rg -n "qwen3-coder|ollama run|ollama-local" README.md`.
- Run `npm.cmd run build:cleanclaw`.
