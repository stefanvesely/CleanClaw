# CleanClaw Release v1.0.0-alpha.1

Date: 2026-04-15
Repo: https://github.com/stefanvesely/CleanClaw

## Summary

First pre-release of CleanClaw following completion of NemoClaw integration Phases 3–9.

## Steps Executed

### Step 3 — Commit
```
git add package.json CHANGELOG.md
git commit -m "Release v1.0.0-alpha.1

- bump version from 0.1.0 to 1.0.0-alpha.1
- add CHANGELOG.md covering Phases 3-9 NemoClaw/CleanClaw integration"
```
Commit: 60544794

### Step 4 — Tag
```
git tag v1.0.0-alpha.1
```

### Step 5 — Push
```
git push origin main
git push origin v1.0.0-alpha.1
```

### Step 6 — GitHub Pre-release
Created via GitHub REST API (gh CLI not installed).
Release URL: https://github.com/stefanvesely/CleanClaw/releases/tag/v1.0.0-alpha.1

## Notes
- gh CLI not found on PATH — used GitHub REST API via PowerShell with git credential manager token
- Release notes sourced directly from CHANGELOG.md v1.0.0-alpha.1 entry
