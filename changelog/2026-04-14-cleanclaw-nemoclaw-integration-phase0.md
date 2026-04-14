# CleanClaw — NemoClaw Integration Phase 0-5
**Date:** 2026-04-14

## Summary
Wired the `nemoclaw create new dev task` CLI command into the full CleanClaw workflow pipeline. Previously the command printed a placeholder message; it now drives an interactive task clarification loop, LLM-powered file scanning, audit trail logging, and hands off to the CleanClaw pipeline.

## Changes

### src/nemoclaw.ts
- `createDevTask()` replaced stub with interactive readline prompt
- Prompts user: "What would you like to build or fix?"
- Dynamically imports `run-workflow.ts` and delegates to `runWorkflow(taskDescription)`

### cleanclaw/cli/run-workflow.ts
- New entry point for the full dev-task workflow
- Orchestrates: task clarification → file discovery → file verification → session log → pipeline handoff

### cleanclaw/core/file-scanner.ts (new file)
- LLM-powered file scanner using `git ls-files` to enumerate repo files
- Sends file list + task description to LLM; receives ranked, relevant file paths
- Bridge re-rank step filters and scores candidates before returning confirmed list

### cleanclaw/core/pipeline.ts
- Scope guard added to the inner loop — checks each proposed change against the approved plan before applying
- `ApprovedPlanContext` always built at `runPipeline()` start
- Classifier failure always halts and prompts for confirmation before continuing

### cleanclaw/core/planning-agent.ts
- Confirmed file list scoped into the planning agent prompt
- Files verified by user (accept / edit / manual entry) are injected as context constraints

### cleanclaw/plans/log-writer.ts
- Session audit trail written to `task.log` before the pipeline runs
- Captures task description, confirmed files, timestamp, and session metadata

### nemoclaw-blueprint/blueprint.yaml
- `cleanclaw` blueprint profile registered
- Provider field set to config-delegated (reads from project config at runtime)
- Credential and inference guards reference CleanClawMode runtime checks

### src/modes/ (new directory)
- `CleanClawMode` runtime added
- Guards: credential present, inference config valid, blueprint config loaded
- Fails fast with clear error messages if any guard is not satisfied

## Why
These changes complete the round-trip from CLI entry point to full pipeline execution, replacing every placeholder with real behaviour. The scope guard and audit trail ensure the pipeline runs within known boundaries and leaves a traceable record per session.
