# Interactive Project And Credentials Fix

Timestamp: 2026-05-25T00:00:00+02:00

## Changed Files

- `cleanclaw/core/project-resolver.ts`
- `cleanclaw/core/project-resolver.test.ts`
- `cleanclaw/core/project-intake.ts`
- `cleanclaw/core/project-intake.test.ts`
- `cleanclaw/core/numbered-prompt.ts`
- `cleanclaw/core/numbered-prompt.test.ts`
- `cleanclaw/cli/setup-wizard.ts`
- `cleanclaw/cli/setup-wizard.test.ts`
- `plans/complete/2026-05-25-interactive-project-and-credentials-fix.md`

## Summary

- Changed active project resolution so a current folder or nearest parent with ordinary project markers is preferred before a stale global active project.
- Added guarded marker scanning so inaccessible parent folders do not crash project detection.
- Added a trailing newline to numbered prompt rendering so typed answers do not appear glued to the prompt text.
- Added support for current-folder phrases such as "the directory I started in" in project directory prompts.
- Added setup wizard credential prompts, including local defaults for Ollama and vLLM and optional remote API key capture.

## Reason

The interactive CleanClaw flow must know the confirmed project, keep the user in control, and avoid silent drift to an old global project. First-run setup also needs an obvious place for users to provide model credentials.

## Validation

- `npx.cmd vitest run cleanclaw/core/project-resolver.test.ts cleanclaw/core/project-intake.test.ts cleanclaw/core/numbered-prompt.test.ts cleanclaw/cli/setup-wizard.test.ts cleanclaw/cli/interactive-session.test.ts cleanclaw/core/credential-resolver.test.ts`
- `npm.cmd run build:cleanclaw`
