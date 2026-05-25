# Smoke Coverage Reconciliation

Timestamp: 2026-05-25 21:58

## Why

Several final acceptance items were backed by focused tests but still listed as open in the master plan.

## Changed Files

- `cleanclaw/cli/interactive-session.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/inprogress/2026-05-25-smoke-coverage-reconciliation.md`

## Summary

- Fixed brittle interactive-session test expectations that hard-coded `2026-05-24` draft plan filenames.
- Re-ran focused smoke coverage for attach/stack inference, ProjectMap reuse policy, planning-first behavior, return-to-planning behavior, headless refusal, and runtime status visibility.
- Marked proven smoke and final acceptance items complete.
- Left live fresh setup, controlled execution, scope expansion, and install usability open for end-to-end validation.

## Validation

- Initial smoke matrix exposed stale date expectations in `cleanclaw/cli/interactive-session.test.ts`.
- Passed after fix: `npx.cmd vitest run cleanclaw/cli/attach-project.test.ts cleanclaw/core/stack-inference.test.ts cleanclaw/core/stack-selection.test.ts cleanclaw/projectmap/manifest.test.ts cleanclaw/projectmap/storage-policy.test.ts cleanclaw/cli/interactive-session.test.ts cleanclaw/core/completion-planning.test.ts cleanclaw/core/headless-execution-policy.test.ts cleanclaw/core/headless-planning-guard.test.ts cleanclaw/core/headless-block-report.test.ts cleanclaw/cli/show-status.test.ts`
- Passed: `npm.cmd run build:cleanclaw`
