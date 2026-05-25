# ProjectMap Commit Eligible

Timestamp: 2026-05-25 01:20 Africa/Johannesburg

## Changed Files

- `.gitignore`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-25-projectmap-commit-eligible.md`

## Summary

- Removed the default `.cleanclaw/projectmap/` ignore rule.
- Added a `.gitignore` note that ProjectMap is commit-eligible by default and governed by the 50 MB warning policy.
- Kept `.cleanclaw/projectmap/registry.json` ignored because it can contain local absolute path pointers.
- Marked the ProjectMap commit-eligible plan item complete.

## Why

ProjectMap is intended to be project-local memory that can travel with the repo when it remains inside the approved storage policy.

## Validation

- `git status --short`
- `git check-ignore .cleanclaw/projectmap/manifest.json`
