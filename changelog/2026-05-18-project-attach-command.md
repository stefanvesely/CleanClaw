# Project Attach Command

Timestamp: 2026-05-18T00:00:00+02:00

## Changed Files

- `bin/cleanclaw.js`
- `.gitignore`
- `cleanclaw/cli/attach-project.ts`
- `cleanclaw/cli/attach-project.test.ts`
- `cleanclaw/cli/show-status.ts`
- `cleanclaw/core/project-markers.ts`
- `cleanclaw/core/project-markers.test.ts`
- `README.md`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-18-project-attach-command.md`
- `changelog/2026-05-18-project-attach-command.md`

## Summary

- Added `cleanclaw attach <path>` so users can deliberately attach CleanClaw to a project directory.
- Added reusable project marker detection for CleanClaw config/settings, Git, Node, .NET, Python, Go, Rust, Java, and common frontend framework markers.
- Updated `cleanclaw status` so settings-only attachments are treated as active projects instead of requiring legacy state first.
- Documented the attach command and marked the matching Phase 1 plan items complete.

## Reason

CleanClaw needs an explicit project-root attachment step before the planning-first agent loop can safely scan, plan, ask for approval, or execute work inside a project boundary.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-markers.test.ts cleanclaw/cli/attach-project.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js attach .`
- `node bin/cleanclaw.js status`
