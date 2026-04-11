# 2026-04-11 — Weekend 7 Polish, Integration Tests + Launch Prep

## What changed

### setup-wizard.ts — first-run detection
- Checks for `~/.cleanclaw/config.json` on startup
- First run: global wizard (provider, API key, granularity) → writes `~/.cleanclaw/config.json`
- Subsequent runs: project init only, inherits provider/key from global config
- Offers to init project immediately after global setup

### Agent unit tests (12 tests, 4 files)
- `cleanclaw/agents/dotnet-agent.test.ts`
- `cleanclaw/agents/svelte-agent.test.ts`
- `cleanclaw/agents/angular-agent.test.ts`
- `cleanclaw/agents/blazor-agent.test.ts`
- Each has 3 tests: valid response parsing, code fence stripping, retry failure assertion
- No live API calls — mocked bridge, CI-safe

### README.md
- Full rewrite from NemoClaw baseline
- Sections: what it is, prerequisites, install, first run, config table, approval granularity, plan/log format, supported stacks, contributing

### CONTRIBUTING.md
- Full rewrite: how to add a language agent, how to run tests, how to submit a PR, smoke test note

### GitHub issue templates
- `bug_report.md` — standard bug report with environment fields
- `feature_request.md` — problem + solution + alternatives
- `real_usage_report.md` — usage tracking: stack, team size, provider, what worked/didn't

## Result
Weekend 7 milestone: PASS — 12 agent tests passing, README complete, launch assets ready.

## Next steps (manual)
- Record demo GIF with asciinema
- Tag `v0.1.0` and make repository public
- Publish LinkedIn article + Reddit/HN posts
