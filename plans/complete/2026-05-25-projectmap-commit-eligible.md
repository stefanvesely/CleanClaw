# ProjectMap Commit Eligible

Created: 2026-05-25 01:18 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 01:20 Africa/Johannesburg

## Why

The plan says ProjectMap is project memory and should be commit-eligible by default under the 50 MB warning threshold. The repo-level ignore file still excludes `.cleanclaw/projectmap/`, which contradicts that policy.

## Assumptions

- Settings and runtime-only state should remain ignored.
- ProjectMap should not be ignored by default.
- This slice changes the policy surface only; it does not force-add any generated ProjectMap files.

## Checklist

- [x] Remove the default ProjectMap ignore rule.
- [x] Document that ProjectMap is commit-eligible by default.
- [x] Update the master plan.
- [x] Run a lightweight status check.
- [x] Add changelog.

## Validation Plan

- Run `git status --short`.
- Confirm `.cleanclaw/projectmap/` is no longer ignored by default.

## Validation Performed

- `git status --short`
- `git check-ignore .cleanclaw/projectmap/manifest.json`
