# 2026-04-11 — Weekend 4 Hardening + Unit Tests

## What changed

### diff-capture.ts hardening
- Out-of-bounds line numbers now return `(file ends at line N)` instead of `(line does not exist)`
- Binary file extensions (`.png`, `.jpg`, `.gif`, `.exe`, `.dll`, `.wasm`) short-circuit with `warning: 'Binary file — diff skipped'`
- Encoding errors wrapped in try/catch — returns `warning: 'Could not read file as UTF-8 — encoding unknown'` instead of crashing
- `DiffCapture` interface extended with `warning?: string`
- Added `import path from 'path'`

### verification-layer.ts
- WHY string now prefixed with `[agent]` (user pressed Enter) or `[user]` (user typed something)
- Audit log now distinguishes agent-generated reasons from developer-written ones

### variant-manager.ts
- Implemented `getNextVariant(taskId, plansDir)` — scans task dir for `*_plan.md` files, returns next letter variant (A → B → C...)
- Was previously a stub `export {}`

### state-manager.ts
- Implemented `CleanClawState` interface and `saveState` / `loadState` functions
- State file stored at `[projectDir]/.cleanclaw-state.json` — never committed to git
- `.cleanclaw-state.json` added to `.gitignore`

### gitignore fix
- Changed `plans/` to `/plans/` to anchor to root — was incorrectly ignoring `cleanclaw/plans/`

### vitest config
- Added `cleanclaw/**/*.test.ts` to the `cli` project include pattern

### Unit tests (12/12 passing)
- `cleanclaw/plans/plan-writer.test.ts` — 4 tests: creates file, throws on overwrite, throws on missing Objective, creates taskXX dir
- `cleanclaw/plans/log-writer.test.ts` — 4 tests: creates file, appends second entry, required sections present, entries in order
- `cleanclaw/plans/diff-capture.test.ts` — 4 tests: new file, existing file lines, out-of-bounds, binary file warning

### E2E smoke test
- `test/smoke/weekend4-e2e.ts` — real file on disk, full pipeline, verifies plan + log artefacts created

## Result
Weekend 4 milestone: PASS — 12 unit tests passing, all hardening steps applied, audit log WHY attribution added.

## Next
Weekend 5 — multi-provider, config merger, approval granularity.
