# Phase 1 Scope And Test Cleanup

Timestamp: 2026-05-19T00:00:00+02:00

## Changed Files

- `cleanclaw/core/project-settings.ts`
- `cleanclaw/core/project-settings.test.ts`
- `cleanclaw/cli/attach-project.ts`
- `cleanclaw/cli/attach-project.test.ts`
- `cleanclaw/core/scope-tree.ts`
- `cleanclaw/core/scope-tree.test.ts`
- `cleanclaw/core/pipeline.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-19-phase1-scope-test-cleanup.md`
- `changelog/2026-05-19-phase1-scope-test-cleanup.md`

## Summary

- Persisted detected project markers in project-local settings during `cleanclaw attach`.
- Added explicit scope-rule helpers for planning reads, planned edits, planned new files, and out-of-root approval requirements.
- Extracted workspace scope review formatting and wired the pipeline through it so scope rendering before the generated plan is testable.
- Marked the remaining Phase 1 scope-rule and test cleanup items complete.

## Reason

Phase 1 needs to be fully closed before CleanClaw moves into the larger interactive planning-loop work.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts cleanclaw/cli/attach-project.test.ts cleanclaw/core/project-settings.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

