# Scope Tree Lifecycle

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/scope-tree.ts`
- `cleanclaw/core/scope-tree.test.ts`
- `cleanclaw/core/pipeline.ts`
- `README.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-18-scope-tree-lifecycle.md`
- `changelog/2026-05-18-scope-tree-lifecycle.md`

## Summary

- Added lifecycle metadata to `scope-tree.json`.
- Added scope-tree helpers for why approval, pre-edit checks, validation command recording, applied changes, and completion.
- Wired pipeline scope-tree updates at deterministic lifecycle points.
- Updated scope-tree formatting and tests for lifecycle visibility.
- Updated README and the active plan to reflect the completed scope-tree lifecycle slice.

## Reason

CleanClaw needs the scope tree to be a live project-control record rather than a startup-only snapshot.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts cleanclaw/core/root-guard.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

