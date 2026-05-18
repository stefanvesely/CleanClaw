# Scope Expansion Pause

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/scope-tree.ts`
- `cleanclaw/core/scope-tree.test.ts`
- `cleanclaw/core/pipeline.ts`
- `plans/inprogress/2026-05-18-scope-expansion-pause.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`

## Summary

- Added helpers to detect whether a file is already in editable scope.
- Added helpers to add files to planned edits or planned new files.
- Recorded out-of-root scope additions as unapproved out-of-root requests.
- Wired the per-change pipeline to pause when a proposed file is not in the visible scope tree.
- Saved and re-rendered the scope tree when the user approves a scope expansion.
- Returned the updated scope tree from per-change execution so follow-up iterations inherit approved scope additions.
- Stopped headless execution instead of allowing scope expansion.
- Avoided reading missing files during new-file proposals.

## Reason

- CleanClaw must not silently widen the workspace scope. The user needs to see and approve file-scope expansion before execution continues.

## Validation

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts`
- `npm.cmd run build:cleanclaw`
