# Render Scope Tree Before Execution

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Show the visible workspace scope tree to the user during plan review before CleanClaw asks whether to proceed with execution.

## Assumptions

- Use the existing `formatScopeTree` helper.
- Keep this slice to rendering visibility, not full scope-expansion enforcement.
- The next slice can handle pause behavior for scope expansion.

## Checklist

- [x] Render scope tree in pipeline plan review.
- [x] Add/update focused tests where practical.
- [x] Update main plan and changelog.
- [x] Run focused validation and build.
- [x] Commit the slice.

## Validation Plan

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts`
- `npm.cmd run build:cleanclaw`

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/scope-tree.test.ts`
- `npm.cmd run build:cleanclaw`
