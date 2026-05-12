# Preserve Dev Dependencies During Local Install

Timestamp: 2026-05-12T18:58:24+02:00

## Changed Files

- `scripts/prepare-package.js`
- `plans/complete/2026-05-12-preserve-dev-dependencies.md`

## Summary

- Updated the `prepare` helper so local repository installs keep dev dependencies installed.
- Preserved the production dependency refresh for non-local/package-style installs.

## Reason

- The previous `prepare` behavior could prune dev dependencies during local setup, removing `typescript` before build commands such as `build:cleanclaw` run.

## Validation

- `node --check scripts/prepare-package.js`
- `git diff --check`
