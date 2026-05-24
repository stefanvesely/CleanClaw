# Project Working Context

Timestamp: 2026-05-24 11:19 Africa/Johannesburg

## Changed Files

- `cleanclaw/core/project-working-context.ts`
- `cleanclaw/core/project-working-context.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-project-working-context.md`

## Summary

- Added a reusable project working context helper.
- Exposed whether the current folder is the project root, a nested folder, or outside the resolved active project.
- Added visible formatting for working context output.
- Added tests for root, nested, outside, and formatted contexts.

## Reason

CleanClaw should feel natural once attached, including from nested folders inside the project.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-working-context.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
