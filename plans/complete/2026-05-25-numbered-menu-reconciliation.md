# Numbered Menu Reconciliation

Created: 2026-05-25 21:50
Status: Complete
Completed: 2026-05-25 21:50

## Why

The master plan still lists major numbered menus as open even though the core numbered prompt helper and major decision prompts now exist. Closing this with evidence keeps the plan accurate.

## Assumptions

- This slice reconciles existing prompt coverage and focused tests.
- Natural-language interaction remains the default for open-ended work.
- Typed ids remain available for advanced users through the numbered prompt parser.

## Checklist

- [x] Verify numbered prompt helper coverage.
- [x] Verify interactive/setup prompt usage.
- [x] Verify runtime, sandbox, reviewer, escalation, stack prompt coverage.
- [x] Mark the numbered-menu master-plan item complete.
- [x] Add changelog entry.
- [x] Run focused validation.

## Evidence

- Core numbered prompt helper supports numbers, ids, defaults, natural language, and retryable invalid states.
- Interactive session uses numbered prompts for next action, plan choice, and project confirmation.
- Setup wizard uses numbered prompts for ProjectMap freshness/storage and approval choices.
- Runtime, sandbox fallback, frontier escalation, reviewer, and stack selection prompts all expose numbered options.

## Validation Performed

- Passed: `npx.cmd vitest run cleanclaw/core/numbered-prompt.test.ts cleanclaw/core/nemoclaw-runtime-prompts.test.ts cleanclaw/core/sandbox-fallback-prompt.test.ts cleanclaw/core/frontier-escalation-policy.test.ts cleanclaw/core/frontier-reviewer-policy.test.ts cleanclaw/core/stack-selection.test.ts`
- Passed: `npm.cmd run build:cleanclaw`

## Validation Plan

- Run focused numbered prompt and prompt policy tests.
- Run `npm.cmd run build:cleanclaw`.
