# Fix CleanClaw Runtime Output Path

Created: 2026-05-12T19:04:42+02:00
Status: complete
Completed: 2026-05-12T19:10:18+02:00

## Assumptions

- `build:cleanclaw` succeeds, but the CLI fails at runtime because generated CleanClaw files are emitted into `cleanclaw/dist/cleanclaw`.
- The existing CLI entrypoint and package `files` list expect runtime files under `dist/cleanclaw`.

## Checklist

- [x] Change the CleanClaw TypeScript output directory to match the CLI imports and package manifest.
- [x] Ensure built CleanClaw modules are marked as ESM at runtime.
- [x] Validate the package entrypoint syntax still checks out.
- [x] Record the change in the changelog and complete this plan.

## Validation Plan

- Ran `node --check bin/cleanclaw.js`.
- Ran `node --check scripts/write-cleanclaw-dist-package.js`.
- Ran local TypeScript build via `node_modules/.bin/tsc.cmd -p tsconfig.cleanclaw.json`.
- Ran `node scripts/write-cleanclaw-dist-package.js`.
- Ran `node bin/cleanclaw.js --version`.
- Ran `node bin/cleanclaw.js status`.
- Ran `git diff --check`.
