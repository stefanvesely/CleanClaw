# Status Project Health

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/project-health.ts`
- `cleanclaw/cli/show-status.ts`
- `cleanclaw/cli/show-status.test.ts`
- `README.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-18-status-project-health.md`
- `changelog/2026-05-18-status-project-health.md`

## Summary

- Added project health collection for config, ProjectMap, runtime, and guardrail state.
- Updated `cleanclaw status` to show active root, config path, ProjectMap status, runtime status, and guardrail status.
- Added focused status tests for settings-only projects, ProjectMap readiness, NemoClaw context markers, and standalone software-only guardrails.
- Updated README and the active plan to reflect the completed status expansion.

## Reason

CleanClaw needs a clear status screen before the interactive coding-agent loop starts, so users can confirm the attached project and current protection layers.

## Validation Performed

- `npx.cmd vitest run cleanclaw/cli/show-status.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

