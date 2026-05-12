# Preserve Dev Dependencies During Local Install

Created: 2026-05-12T18:58:24+02:00
Status: complete
Completed: 2026-05-12T19:00:12+02:00

## Assumptions

- The local `npm install` completed far enough to run `prepare`, but `prepare` then pruned dev dependencies with `npm install --omit=dev --ignore-scripts`.
- `build:cleanclaw` should be run from a development install where `typescript` is available through `node_modules/.bin`.

## Checklist

- [x] Prevent the `prepare` helper from pruning dev dependencies in a local repository install.
- [x] Preserve the production dependency refresh for package/global installs where it is still useful.
- [x] Validate script syntax and git whitespace.
- [x] Update changelog and complete this plan.

## Validation Plan

- Ran `node --check scripts/prepare-package.js`.
- Ran `git diff --check`.
- Provide the exact reinstall/build commands for the user to retry.
