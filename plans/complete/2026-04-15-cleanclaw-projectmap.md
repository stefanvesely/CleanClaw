# CleanClaw — Project Map Feature Plan
**Date:** 2026-04-15
**Task:** CleanClaw Project Map
**Status:** APPROVED — Ready for Step 1

---

## Overview

Add a persistent project registry to CleanClaw so that previously registered projects can be recalled, browsed, and re-selected without re-entering paths. The registry lives in `.cleanclaw/projectmap/` inside the target project repo (tracked by git, travels with the project). Plans live in `.cleanclaw/plans/` (gitignored).

---

## Confirmed Decisions

| Decision | Resolution |
|---|---|
| Registry location | `.cleanclaw/projectmap/` inside the project repo |
| Plans location | `.cleanclaw/plans/` inside the project repo |
| `.gitignore` | `.cleanclaw/plans/` gitignored; `.cleanclaw/projectmap/` tracked |
| Registry format | Single JSON file: `registry.json` |
| Registry entry shape | `{ name, path, addedAt }` |
| Entry point wiring | `appendToRegistry` called in BOTH `setup-wizard.ts` AND `add-project.ts` |
| Duplicate handling | Check by `path` before appending; skip silently if already registered |
| CLI command to list | `cleanclaw projects` (or `cleanclaw list-projects`) — TBD in implementation |

---

## Code Style Constraints

- Write simple, readable code — prefer direct obvious logic over clever abstractions
- Do not introduce utility abstractions unless clearly needed
- Only make changes explicitly requested — do not refactor surrounding code
- One logical change per step — no bundling

---

## 12-Step Implementation Plan

### Step 1 — Create `projectmap/registry.ts`
- **File:** `src/projectmap/registry.ts` (new file)
- Create the registry module with three functions:
  - `getRegistryPath(projectRoot: string): string` — resolves `.cleanclaw/projectmap/registry.json`
  - `appendToRegistry(projectRoot: string, name: string, path: string): void` — reads existing entries, checks for duplicate by `path`, appends `{ name, path, addedAt }` if not present, writes back
  - `readRegistry(projectRoot: string): RegistryEntry[]` — reads and returns all entries; returns `[]` if file does not exist
- Define and export the `RegistryEntry` interface: `{ name: string; path: string; addedAt: string }`

---

### Step 2 — Create `.cleanclaw/projectmap/` directory initialisation
- **File:** `src/projectmap/registry.ts` (same file as Step 1)
- Inside `appendToRegistry`, ensure the directory `.cleanclaw/projectmap/` is created if it does not exist (`fs.mkdirSync` with `{ recursive: true }`) before writing `registry.json`

> Note: Step 2 may be merged into Step 1 at implementation time since it is part of the same function — this is the only permitted bundling exception and must be declared at the point it happens.

---

### Step 3 — Add `.cleanclaw/plans/` to `.gitignore`
- **File:** `.gitignore` in the project root (or the template `.gitignore` CleanClaw writes into new projects)
- Append `.cleanclaw/plans/` as an ignored path
- `.cleanclaw/projectmap/` must NOT be ignored

---

### Step 4 — Wire `appendToRegistry` into `setup-wizard.ts`
- **File:** `src/setup-wizard.ts` (or wherever the wizard finalises a new project setup)
- After the project is registered/created, call `appendToRegistry(projectRoot, projectName, projectPath)`
- Import from `./projectmap/registry`

---

### Step 5 — Wire `appendToRegistry` into `add-project.ts`
- **File:** `src/add-project.ts` (or equivalent file that handles the add-project flow)
- Same as Step 4 — call `appendToRegistry` after the project is confirmed
- This ensures both registration paths write to the registry

---

### Step 6 — Create `src/projectmap/list-projects.ts`
- New file that exports a `listProjects(projectRoot: string): void` function
- Reads registry via `readRegistry`, prints each entry as: `[name] — [path] (added: [addedAt])`
- If registry is empty, prints: `No projects registered yet.`

---

### Step 7 — Register `cleanclaw projects` CLI command
- **File:** `src/cli.ts` (or equivalent CLI entry point)
- Add a new command `projects` (or `list-projects`) that calls `listProjects`
- Keep it minimal — no flags needed at this stage

---

### Step 8 — Add `RegistryEntry` type export to barrel (if applicable)
- **File:** `src/projectmap/index.ts` (create if a barrel exists pattern in the codebase; skip if not used)
- Re-export `RegistryEntry`, `appendToRegistry`, `readRegistry`, `listProjects`

---

### Step 9 — Unit test: `appendToRegistry` deduplication
- **File:** `src/projectmap/registry.test.ts` (new file)
- Test: calling `appendToRegistry` twice with the same path results in only one entry
- Test: calling with different paths produces two entries
- Use the existing test framework already in the project (check `package.json`)

---

### Step 10 — Unit test: `readRegistry` when file missing
- **File:** `src/projectmap/registry.test.ts` (same file as Step 9)
- Test: `readRegistry` returns `[]` when `registry.json` does not exist
- Test: `readRegistry` returns correct entries after `appendToRegistry` has run

---

### Step 11 — Integration smoke test: end-to-end project registration
- Manual verification step (not automated)
- Run `cleanclaw add-project` (or setup wizard) against a test directory
- Confirm `registry.json` is created at `.cleanclaw/projectmap/registry.json`
- Confirm entry appears when running `cleanclaw projects`
- Confirm second run with same path does not duplicate the entry

---

### Step 12 — Changelog + standup
- Write changelog entry to `[project-root]/changelog/2026-04-15-cleanclaw-projectmap.md`
- Update standup via `standup` agent with task commits

---

## Files To Be Created

| File | Purpose |
|---|---|
| `src/projectmap/registry.ts` | Core registry read/write/append logic |
| `src/projectmap/list-projects.ts` | CLI list formatter |
| `src/projectmap/index.ts` | Barrel export (if pattern exists) |
| `src/projectmap/registry.test.ts` | Unit tests |

## Files To Be Modified

| File | Change |
|---|---|
| `src/setup-wizard.ts` | Call `appendToRegistry` after project setup |
| `src/add-project.ts` | Call `appendToRegistry` after project add |
| `src/cli.ts` | Register `projects` command |
| `.gitignore` | Add `.cleanclaw/plans/` |

---

## Out of Scope

- Project removal / deregistration (deferred)
- Interactive project picker UI (deferred)
- Registry migration or versioning (not needed yet)
- Setup wizard phases 8-9 (already deferred per unified integration plan)
