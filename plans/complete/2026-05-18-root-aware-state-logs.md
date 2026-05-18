# Root-Aware State And Logs

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Finish the Phase 1 root-aware loading item by making state/log-related paths use the active project root instead of accidental shell cwd.

## Why

CleanClaw must act inside the attached project boundary. If state, logs, or config drift to the caller's shell directory, the user loses control over what project CleanClaw thinks it is managing.

## Assumptions

- Config root-awareness is already implemented and tested.
- This slice should focus on state/log path helpers and CLI call sites with focused coverage.
- Broader legacy migration into `.cleanclaw/` remains a later task.

## Checklist

- [x] Inspect state/log path call sites for accidental `process.cwd()` use.
- [x] Add or adjust root-aware helpers where useful.
- [x] Update focused tests.
- [x] Update README and active plan progress.
- [x] Add changelog.
- [x] Validate focused tests/build/status smoke.
- [x] Move plan to complete and commit.

## Validation Plan

- `rg -n "process\\.cwd\\(|loadState\\(|saveState\\(|plansDir" cleanclaw`
- focused tests based on changed modules
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

## Validation Results

- `npx.cmd vitest run cleanclaw/core/project-paths.test.ts cleanclaw/cli/show-status.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `rg -n "path\\.resolve\\(routedConfig\\.plansDir\\)|loadState\\(process\\.cwd\\(\\)|const projectRoot = process\\.cwd\\(\\)" cleanclaw` returned no matches.
- `node bin/cleanclaw.js status` passed.
