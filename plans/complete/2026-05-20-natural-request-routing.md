# Natural Request Routing

Created: 2026-05-20 20:24 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:25 Africa/Johannesburg

## Why

CleanClaw should understand natural user requests and map them to safe planning/review actions, while still using numbered choices when a real decision needs confirmation.

## Assumptions

- Routing should be conservative and confirmation-first.
- The first slice should classify intent; later UI work can render numbered menus.
- Ambiguous requests should ask for confirmation rather than choose silently.

## Checklist

- [x] Add natural request routing helper.
- [x] Route planning, review, continue, cancel, revise, and project-question intents.
- [x] Return confirm when intent is ambiguous.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused request-routing tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/request-routing.test.ts cleanclaw/core/project-question.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
