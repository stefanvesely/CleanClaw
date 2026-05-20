# Context Continuity

Created: 2026-05-20 20:12 Africa/Johannesburg
Status: Complete
Completed: 2026-05-20 20:11 Africa/Johannesburg

## Why

CleanClaw should keep context when the next task is naturally related, separate context when it is unrelated, and ask the user when it is uncertain.

## Assumptions

- The first implementation should be deterministic and conservative.
- Shared meaningful keywords are enough to suggest keeping context.
- No meaningful overlap should separate context; weak overlap should ask the user.

## Checklist

- [x] Add context continuity classifier.
- [x] Add keep/separate/confirm decisions.
- [x] Add user-visible summary formatting.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused context-continuity tests.
- Run `npm.cmd run build:cleanclaw`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/context-continuity.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
