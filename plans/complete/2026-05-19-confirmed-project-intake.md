# Confirmed Project Intake

Created: 2026-05-19 00:00 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 16:59 Africa/Johannesburg

## Why

CleanClaw must only proceed with a confirmed project, while still helping the user work from the wrong folder by making its evidence visible and asking for the correct directory when needed.

## Assumptions

- The next useful Phase 2 slice is project intake, not cross-project in-progress plan search.
- In-progress plan discovery remains confirmed-project-only.
- The session may suggest the current or active project, but it must not treat it as confirmed until the user confirms.

## Checklist

- [x] Add a small project-intake helper that summarizes what CleanClaw knows about the candidate project.
- [x] Include project markers in the visible evidence.
- [x] Ask for an explicit project directory when the candidate project is rejected or missing.
- [x] Keep in-progress plan discovery gated behind confirmed project.
- [x] Update the master plan.
- [x] Add focused tests.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused interactive-session and project-intake tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/project-intake.test.ts cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
