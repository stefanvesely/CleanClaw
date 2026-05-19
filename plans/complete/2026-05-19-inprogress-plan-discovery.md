# In-Progress Plan Discovery

Created: 2026-05-19T00:00:00+02:00
Status: Complete
Completed: 2026-05-19T00:00:00+02:00

## Goal

Add confirmed-project-only in-progress plan discovery to the interactive session.

## Why

After CleanClaw knows the task and the confirmed project, it should show whether unfinished plans already exist before asking the user to start new work.

## Assumptions

- Search only the confirmed project.
- This slice remains read-only.
- Continuing a plan only summarizes and asks whether it is still okay; execution comes later.

## Checklist

- [x] Add reusable in-progress plan discovery/summarization helper.
- [x] Wire discovery into the interactive session after project confirmation.
- [x] Ask continue/new when plans exist.
- [x] Show selected plan summary and ask whether it is still okay.
- [x] Add focused tests.
- [x] Update active plan and changelog.
- [x] Validate focused tests/build.
- [x] Move plan to complete and commit.

## Validation Plan

- focused tests based on changed modules
- `npm.cmd run build:cleanclaw`
- CLI help smoke

## Validation Results

- `npx.cmd vitest run cleanclaw/core/plan-discovery.test.ts cleanclaw/cli/interactive-session.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js --help` passed.
