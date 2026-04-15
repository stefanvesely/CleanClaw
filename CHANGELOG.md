# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-alpha.1] - 2026-04-15

### Added

- Phase 3: Iteration loop foundation — pipeline runs successive improvement cycles with per-iteration plan files
- Phase 4: Iteration filename suffix written to `writePlan()` so each cycle produces a uniquely named plan
- Phase 5a: Scope guard system — classifier checks every proposed change against the approved plan and halts on violation
- Phase 5b: Scope guard wired into the pipeline inner loop and boss-agent iteration boundary
- Phase 7: Setup wizard delegation (opt-in) — delegates project onboarding to a dedicated setup wizard agent
- Phase 8 + 9: Project root boundary enforcement — agents cannot read or write outside the declared project root
- CleanClaw dev workflow integrated into NemoClaw (Phases 0–5): credential handoff, inference config normalisation, cleanclaw-mode routing
- `bin/cleanclaw.js` binary entry point with SPDX header and correct shebang for tsx
- Blueprint profile for CleanClaw conforming to the `inferenceProfile` schema
- `iterationCount` propagated to all `saveState()` call sites

### Changed

- README updated to reflect completed NemoClaw integration and remove PoC notice
- `cleanclaw-mode.ts` moved to `cleanclaw/modes/` to fix `tsconfig` rootDir violation
- Cross-boundary imports from `src/lib` removed from `cleanclaw-mode.ts`
- TypeScript config updated to prevent tracing cleanclaw imports in `createDevTask`

### Fixed

- Pre-push CI failures: ESLint `sourceType` config, shebang file permissions, trailing whitespace
- Markdownlint CI failures — pre-existing files ignored, changelog lint errors resolved
- `bin/cleanclaw.js` CI failures resolved
- Missing `iterationCount` in `saveState()` call sites

### Chore

- Prettier formatting applied across cleanclaw bin files
- SPDX licence headers added to cleanclaw files
- Markdownlint ignore file added for pre-existing upstream content
