# Fix Windows npm Prepare

Timestamp: 2026-05-12T17:59:35+02:00

## Changed Files

- `package.json`
- `scripts/prepare-package.js`
- `plans/complete/2026-05-12-fix-windows-npm-prepare.md`

## Summary

- Replaced the POSIX shell-only npm `prepare` lifecycle command with a cross-platform Node script.
- Preserved the previous behavior: build CLI when TypeScript is available, refresh production dependencies without scripts as an optional step, and install `prek` hooks only when available.
- Made npm invocation use `npm_execpath` during lifecycle execution so it does not depend on `npm` being visible in the ambient Windows PATH.

## Reason

- `npm install` on Windows runs lifecycle commands through `cmd.exe`, which cannot parse `command -v`, POSIX test brackets, or shell redirection syntax used by the existing `prepare` script.

## Validation

- `node --check scripts/prepare-package.js`
- `git diff --check`
- Confirmed `package.json` points `prepare` to `node scripts/prepare-package.js`.
- Did not rerun `npm install` from Codex because `npm` is not available on this shell PATH; this change targets the failure reported from the user's npm-enabled terminal.
