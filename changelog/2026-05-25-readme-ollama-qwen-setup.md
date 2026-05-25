# README Ollama Qwen Setup

Timestamp: 2026-05-25 22:11

## Why

New CleanClaw users need a clear manual setup path for attaching a local coding LLM before the first-run model installer is automated.

## Changed Files

- `README.md`
- `plans/inprogress/2026-05-25-readme-ollama-qwen-setup.md`

## Summary

- Added a README section for setting up Ollama with `qwen3-coder:30b`.
- Included install, version check, server check, model run, API test, and CleanClaw `ollama-local` config direction.
- Noted that the coding model is not bundled and that smaller models may be needed on limited hardware.

## Validation

- Passed: `rg -n "qwen3-coder|ollama run|ollama-local|Local coding model with Ollama" README.md`
- Passed: `npm.cmd run build:cleanclaw`
