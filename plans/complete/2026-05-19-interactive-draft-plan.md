# Interactive Draft Plan

Created: 2026-05-19 17:10 Africa/Johannesburg
Status: Complete
Completed: 2026-05-19 17:11 Africa/Johannesburg

## Why

CleanClaw should default into planning mode by creating a visible project-local draft plan before any implementation can happen.

## Assumptions

- This slice applies when the user chooses a new plan.
- Continued plans should not create a new draft plan.
- The draft plan should include task, why, requester, beneficiary, what CleanClaw knows, and what still needs confirmation.

## Checklist

- [x] Add a helper to create project-local draft plan files.
- [x] Ask for requester and beneficiary when creating a new plan.
- [x] Return the draft plan path from the interactive session.
- [x] Keep continued-plan flow from creating duplicate plans.
- [x] Update focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused interactive-session and draft-plan tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/session-plan.test.ts cleanclaw/cli/interactive-session.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
