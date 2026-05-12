# Align CleanClaw Provider Metadata

Created: 2026-05-12T19:19:10+02:00
Status: complete
Completed: 2026-05-12T19:28:08+02:00

## Assumptions

- The next inline NemoClaw alignment task is provider metadata parity across setup, credentials, routing, and defaults.
- CleanClaw should keep its legacy aliases (`openai`, `anthropic`) but present NemoClaw provider ids first in user-facing setup.
- Local provider credential env names should match NemoClaw's sandbox proxy token env names.

## Checklist

- [x] Add a shared CleanClaw provider metadata module.
- [x] Wire credential resolution, gateway routing, and bridge defaults to the shared metadata.
- [x] Expand `cleanclaw init` provider prompt to list NemoClaw provider ids.
- [x] Update focused provider metadata tests.
- [x] Validate build/tests and update records.

## Validation Plan

- Ran `node_modules/.bin/tsc.cmd -p tsconfig.cleanclaw.json`.
- Ran `node_modules/.bin/vitest.cmd run cleanclaw/core/credential-resolver.test.ts cleanclaw/core/gateway-routing.test.ts`.
- Ran `node scripts/write-cleanclaw-dist-package.js`.
- Ran `node bin/cleanclaw.js status`.
- Ran `git diff --check`.
