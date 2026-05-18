# Scope Tree Lifecycle

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Update the project-local scope tree across the task lifecycle instead of only creating it at task startup.

## Why

The user needs to see what CleanClaw is doing almost in real time. If the scope tree records why approval, validation commands, and completion state, it becomes a reliable control surface instead of a stale snapshot.

## Assumptions

- Initial scope tree creation, terminal rendering, and scope-expansion updates already exist.
- This slice should add lifecycle metadata without redesigning the full interactive planning loop.
- Validation command approval remains a later per-command control task, but the tree can record planned validation commands now.

## Checklist

- [x] Inspect current scope tree schema and write points.
- [x] Add lifecycle fields/helpers for why approval, pre-edit, validation, and completion updates.
- [x] Wire pipeline lifecycle updates where already deterministic.
- [x] Add focused tests.
- [x] Update README and active plan progress.
- [x] Add changelog.
- [x] Validate focused tests/build/status smoke.
- [x] Move plan to complete and commit.

## Validation Plan

- focused scope-tree tests
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

## Validation Results

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts cleanclaw/core/root-guard.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js status` passed.

## Notes

- Scope tree lifecycle now records why approval, pre-edit checks, applied changes, validation-planned status, and completion.
- Validation command extraction is intentionally conservative and records likely commands from generated plan steps; per-command approval remains a later control task.
