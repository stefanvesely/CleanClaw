# Interactive Project And Credentials Fix

Created: 2026-05-25T00:00:00+02:00
Completed: 2026-05-25T00:00:00+02:00
Status: complete

## Why

CleanClaw must inspire confidence by knowing when the user's current folder is the project, asking cleanly, and giving users a clear setup path for model credentials. The current interactive session can drift to a stale global project, print prompts without a usable input line, reject natural "directory I started in" answers, and leave users without an API key setup path.

## Assumptions

- A current directory with ordinary project markers should beat a stale global active project.
- CleanClaw-specific settings and config still beat generic markers.
- API keys can be stored in the existing user-level CleanClaw config because the runtime already reads those fields.

## Checklist

- [x] Prefer the current project marker root before global active project fallback.
- [x] Make numbered prompts leave a clean input line.
- [x] Resolve natural-language current-folder answers in project directory prompts.
- [x] Add setup wizard credential capture for provider defaults.
- [x] Add focused tests.
- [x] Validate with focused tests and build.

## Validation Plan

- Run focused Vitest files for project resolution, project intake, numbered prompts, setup wizard helpers, and interactive session behavior.
- Run the CleanClaw TypeScript build.
