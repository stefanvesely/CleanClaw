# Smoke Coverage Reconciliation

Created: 2026-05-25 21:57
Status: Complete
Completed: 2026-05-25 21:58

## Why

Several final acceptance items are backed by focused tests even though the master plan still lists them open. Closing proven items lets the remaining list show only live/end-to-end validation gaps.

## Assumptions

- Focused test coverage can close capability acceptance items.
- Full scenario smoke items remain open until exercised as scenarios.
- Live install and live controlled execution remain open unless directly validated.

## Checklist

- [x] Validate attach and stack inference coverage.
- [x] Validate ProjectMap build/reuse policy coverage.
- [x] Validate planning-first and return-to-planning coverage.
- [x] Validate unsafe headless refusal coverage.
- [x] Validate runtime status visibility coverage.
- [x] Mark only proven acceptance items complete.
- [x] Add changelog entry.
- [x] Run focused validation and build.

## Notes

- Fixed date-sensitive interactive-session test expectations so generated draft plan filenames use the current test date.
- Full fresh setup and controlled execution scenario smokes remain open because they still need end-to-end workflow validation.

## Validation Performed

- Initial smoke matrix exposed stale 2026-05-24 expectations in `cleanclaw/cli/interactive-session.test.ts`.
- Passed after fix: `npx.cmd vitest run cleanclaw/cli/attach-project.test.ts cleanclaw/core/stack-inference.test.ts cleanclaw/core/stack-selection.test.ts cleanclaw/projectmap/manifest.test.ts cleanclaw/projectmap/storage-policy.test.ts cleanclaw/cli/interactive-session.test.ts cleanclaw/core/completion-planning.test.ts cleanclaw/core/headless-execution-policy.test.ts cleanclaw/core/headless-planning-guard.test.ts cleanclaw/core/headless-block-report.test.ts cleanclaw/cli/show-status.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run focused acceptance-related tests.
- Run `npm.cmd run build:cleanclaw`.
