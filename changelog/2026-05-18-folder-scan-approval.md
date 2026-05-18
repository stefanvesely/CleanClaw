# Folder Scan Approval

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `cleanclaw/core/folder-scan-approval.ts`
- `cleanclaw/core/folder-scan-approval.test.ts`
- `cleanclaw/cli/run-workflow.ts`
- `README.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-18-folder-scan-approval.md`
- `changelog/2026-05-18-folder-scan-approval.md`

## Summary

- Added project-local broad folder scan approval records.
- Updated workflow scanning to announce broad scans, ask for approval, and record the answer before calling the file scanner.
- Denied scans now skip automatic discovery and let the user specify files manually.
- Headless mode fails closed before broad folder scanning.
- Updated README and the active plan to reflect the completed scope rule.

## Reason

CleanClaw must not inspect broad project context silently; the user should approve and understand the reason for the scan first.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/folder-scan-approval.test.ts cleanclaw/core/task-records.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

