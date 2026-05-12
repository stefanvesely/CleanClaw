# CleanClaw Next Work

Created: 2026-05-10
Updated: 2026-05-12T19:56:08+02:00
Status: Incomplete
Source: Review of `README.md`, April Claude plan files, changelog entries, and current source tree.

## Assumptions

- `D:\Projects\CC\CleanClaw` is the active project root.
- Completed implementation slices are tracked in `plans/complete/`.
- This file should list only remaining cross-cutting work.

## Incomplete Work

- [ ] Restore and finish the local verification environment.
  - Local `node_modules` and CleanClaw build output are now available.
  - Focused CleanClaw verification has run successfully.
  - Full Vitest timed out after four minutes in the current Windows shell.
  - Current live failures to address are Windows symlink/prompt subprocess behavior, broad installer shell-harness status/output failures, and root NemoClaw CLI/Oclif dispatch returning code `2` for the gateway trust guidance case.

## Completed Work Records

Completed items formerly listed here now live in `plans/complete/`, including local embedding defaults, NemoClaw credential handoff, secret redaction, structured logging, session/context handoff, gateway routing, sandbox runtime delegation, provider metadata alignment, and failure-log triage.

## Validation Plan

- Run focused tests for the remaining live failures.
- Fix root NemoClaw CLI/Oclif dispatch before re-running the gateway trust guidance test.
- Re-run installer-preflight tests in a shell environment that captures stdout/stderr correctly.
- Re-run the broader Vitest suite after focused fixes land.

## Notes

Historical Claude plans are preserved as source material, but current active implementation work should be split into new `plans/inprogress/` records before code changes begin.
