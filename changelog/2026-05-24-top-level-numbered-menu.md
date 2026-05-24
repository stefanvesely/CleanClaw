# Top-Level Numbered Menu

Timestamp: 2026-05-24 18:30 Africa/Johannesburg

## Changed Files

- `cleanclaw/cli/interactive-session.ts`
- `cleanclaw/cli/interactive-session.test.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-top-level-numbered-menu.md`

## Summary

- Wired the numbered prompt helper into the interactive session loop's top-level next-action prompt.
- Kept task entry natural-language by default.
- Allowed natural language typed at the top-level menu to become the next task directly.
- Added coverage for continuing by default, exiting by number, and routing natural-language menu input.

## Reason

CleanClaw should use numbered choices at clear decision points without making the normal conversation mechanical.

## Validation

- `npx.cmd vitest run cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
