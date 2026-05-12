# Fix Windows npm Prepare

Created: 2026-05-12T17:59:35+02:00
Status: complete
Completed: 2026-05-12T18:04:30+02:00

## Assumptions

- The reported install failure happens because npm runs lifecycle scripts through `cmd.exe` on Windows.
- The current `prepare` script should keep its intended behavior: build CLI when TypeScript is available, install production dependencies without scripts, and optionally install git hooks when `prek` is available.

## Checklist

- [x] Replace POSIX shell-only `prepare` command with a cross-platform script.
- [x] Preserve existing install behavior and skip optional steps when tools are unavailable.
- [x] Validate the script syntax and the package script wiring.
- [x] Record the change in the changelog.

## Validation Plan

- Ran `node --check scripts/prepare-package.js`.
- Ran `git diff --check`.
- Confirmed `package.json` points `prepare` to the new Node helper.
- Could not run `npm install` from this Codex shell because `npm` is not on PATH here; the helper now uses npm's lifecycle-provided `npm_execpath` when available.
