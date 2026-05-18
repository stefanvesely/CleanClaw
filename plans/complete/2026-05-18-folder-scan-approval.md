# Folder Scan Approval

Created: 2026-05-18T00:00:00+02:00
Status: Complete
Completed: 2026-05-18T00:00:00+02:00

## Goal

Require broad folder scanning to be announced, approved, and recorded before CleanClaw scans the project.

## Why

CleanClaw may need project context, but the user must know when a scan is broad and why it is happening. Folder scanning is a control boundary, not background noise.

## Assumptions

- This slice focuses on the existing workflow scan path.
- Headless mode should not prompt and should stop if broad scan approval is required.
- The approval record can live in the existing task record approval log when a task exists.

## Checklist

- [x] Inspect current file scanner and workflow scan path.
- [x] Add broad scan approval/recording helper.
- [x] Wire workflow scanning through the helper.
- [x] Add focused tests.
- [x] Update README and active plan progress.
- [x] Add changelog.
- [x] Validate focused tests/build/status smoke.
- [x] Move plan to complete and commit.

## Validation Plan

- focused tests based on changed modules
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js status`

## Validation Results

- `npx.cmd vitest run cleanclaw/core/folder-scan-approval.test.ts cleanclaw/core/task-records.test.ts` passed.
- `npm.cmd run build:cleanclaw` passed.
- `node bin/cleanclaw.js status` passed.

## Notes

- Broad scan approval is stored in `.cleanclaw/scan-approval-records.json`.
- Denied scans skip automatic file discovery and fall back to manual file entry.
- Headless mode cannot approve broad scans and fails closed before scanning.
