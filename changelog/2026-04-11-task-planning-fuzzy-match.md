# 2026-04-11 — Structured task intake + fuzzy filename matching

## What changed

### `cleanclaw/cli/run-workflow.ts`
Replaced the two-question task intake (which files? any context?) with a four-question structured spec questionnaire:
1. Why does this task matter?
2. Which files should be changed?
3. Acceptance criteria — what does "done" look like?
4. Out of scope — what should NOT change?

The answers are assembled into a labelled spec block passed to the planning agent, giving it substantially richer context before generating a plan.

### `cleanclaw/core/pipeline.ts`
Added `levenshtein()` and `fuzzyMatchFilename()` — a pure-TypeScript directory walker with edit-distance scoring (no new npm dependencies). Threshold is `max(2, floor(name.length * 0.2))`.

Wired into `validateFilename()`: when a proposed filename does not exist on disk, the fuzzy matcher scans the project directory for close matches. If one is found, the user is prompted:
```
⚠ "Asburton2021Master.Master" does not exist.
  Did you mean: "Ashburton2021Master.Master"?
  [y = use match / n = create new / c = cancel]:
```
If no match is found, the original "create NEW FILE?" prompt is shown unchanged.

## Why
- Task planning lacked structure — the agent received a vague blob with no why/criteria/scope, producing lower-quality plans.
- Typos in filenames caused CleanClaw to silently offer to create new files instead of resolving the likely intended target.
