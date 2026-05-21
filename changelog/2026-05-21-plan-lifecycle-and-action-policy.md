# 2026-05-21 — Plan lifecycle tracking and explicit action policy

## Phase 2: Plan lifecycle management

- Added `PlanStatus` type with statuses: draft, needs-user-review, approved, ready-for-execution, inprogress, blocked, cancelled, complete
- Added `readPlanStatus` / `writePlanStatus` helpers for reading and updating the Status line in plan markdown files
- Added `completePlan()` helper that writes complete status and moves the plan file from `plans/inprogress/` to `plans/complete/`
- Updated `listInProgressPlans` to filter out plans with terminal statuses (complete, cancelled)
- Added 15 tests covering status round-trip, lifecycle moves, and filtered discovery

## Phase 0: Action policy and frontier rejection tests

- Added `permitted-actions.ts` with explicit `PERMITTED_WITHOUT_ASKING` and `NEVER_WITHOUT_ASKING` action lists, resolving two unchecked Phase 0 deliverables
- Added 2 frontier model purpose-specific rejection tests to `control-contract.test.ts` — verifying that approval for one purpose does not grant access for another

## Files changed

- `cleanclaw/core/plan-status.ts` (new)
- `cleanclaw/core/plan-status.test.ts` (new)
- `cleanclaw/core/plan-lifecycle.ts` (new)
- `cleanclaw/core/plan-lifecycle.test.ts` (new)
- `cleanclaw/core/permitted-actions.ts` (new)
- `cleanclaw/core/plan-discovery.ts` (modified)
- `cleanclaw/core/plan-discovery.test.ts` (modified)
- `cleanclaw/core/control-contract.test.ts` (modified)
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md` (updated checkboxes)
