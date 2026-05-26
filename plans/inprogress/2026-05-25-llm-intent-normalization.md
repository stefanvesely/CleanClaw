# LLM Intent Normalization

Created: 2026-05-25T00:00:00+02:00
Status: in-progress

## Why

CleanClaw should not depend on long lists of hard-coded phrases to understand normal user language. Users should be able to type natural instructions like "use the folder I launched from", "carry on with the last thing", or "set this up for OpenAI", and CleanClaw should convert that language into a safe internal action only when it can explain why the mapping is correct.

The guiding principle is still control: the LLM may interpret, summarize, and suggest, but it must not directly execute or mutate state. CleanClaw should keep deterministic commands, numbered options, approval gates, logs, and validation records as the trusted layer underneath.

## Current Problem

CleanClaw currently relies on hard-coded string matching in places such as:

- `cleanclaw/core/request-routing.ts` for natural request routing.
- `cleanclaw/core/project-intake.ts` for current-directory phrases.
- `cleanclaw/core/numbered-prompt.ts` for option id / number / control parsing.

This works for known wording but will keep growing brittle phrase lists. It also makes the experience less like a coding agent because CleanClaw does not really interpret intent; it pattern-matches.

## Target Behavior

CleanClaw should parse user text through an LLM-backed intent normalizer that returns a strict internal object:

```json
{
  "intent": "continue-plan",
  "confidence": "high",
  "why": "The user asked to continue existing work.",
  "normalizedInput": "continue existing plan",
  "entities": {
    "projectDirectory": null,
    "taskSummary": null,
    "provider": null,
    "planReference": null
  },
  "requiresConfirmation": false,
  "clarifyingQuestion": null
}
```

The output becomes the only thing downstream CleanClaw consumes. User text should not be passed directly into execution paths.

## Non-Negotiable Guardrails

- The LLM parser is read-only and cannot change files, settings, plans, git state, or project state.
- The parser can only return one of CleanClaw's allowlisted internal intents.
- Low-confidence, conflicting, or unsupported interpretations must become a user question, not an action.
- The parser must include a `why` field for every interpretation.
- Deterministic numbered options still win when the user types a number.
- Existing approval granularity remains in force after intent parsing.
- Planning remains user-led; the parser can clarify intent but cannot invent approved scope.
- Headless mode may use this parser only after a user-created plan exists.

## Proposed Intent Types

- `start-plan`
- `continue-plan`
- `review-plan`
- `revise-task`
- `cancel-task`
- `project-question`
- `confirm-project`
- `choose-project-directory`
- `choose-provider`
- `set-api-key`
- `choose-model`
- `choose-stack`
- `approve-action`
- `reject-action`
- `request-status`
- `exit`
- `unknown`

## Architecture

1. Add `cleanclaw/core/intent-normalizer.ts`.
   - Accept raw user text plus local context.
   - Prefer deterministic parsing for numbers, option ids, and controls.
   - Use an LLM provider only for free text.
   - Validate the returned JSON against a strict schema.
   - Downgrade invalid output to `unknown`.

2. Add `cleanclaw/core/intent-schema.ts`.
   - Define the intent union.
   - Define allowed entity fields.
   - Define confidence and confirmation rules.
   - Export validation helpers.

3. Add `cleanclaw/core/intent-prompts.ts`.
   - Build the parser prompt.
   - Include allowed intents only.
   - Include current prompt options when interpreting menu answers.
   - Require a concise `why`.
   - Forbid execution, code writing, or hidden assumptions.

4. Update `request-routing.ts`.
   - Keep the existing hard-string router as a deterministic fallback.
   - Add an async LLM route path for interactive sessions.
   - Preserve the current sync function for tests and safe offline behavior.

5. Update `project-intake.ts`.
   - Replace growing current-directory phrase lists with intent/entity parsing.
   - Keep simple deterministic support for `.`, absolute paths, and relative paths.
   - If LLM returns `choose-project-directory` with `projectDirectory: "current"`, resolve to startup cwd.

6. Update interactive session flow.
   - When a numbered prompt allows natural language, send free text to the intent normalizer.
   - Show the user the interpreted action and why when confirmation is needed.
   - Never silently mutate state from a low-confidence interpretation.

## Local vs Frontier Model Routing

Default order:

1. Deterministic parser for numbers, ids, paths, and explicit controls.
2. Local LLM for normal intent parsing.
3. Frontier model only if:
   - The local model is unavailable.
   - The local model returns invalid JSON repeatedly.
   - The user has approved frontier escalation.
   - The request is complex enough to justify escalation.

The parser should prefer local because this is not a hard coding task; it is lightweight language normalization.

## User Experience

Example:

User types:

```text
the directory I started in
```

CleanClaw internally normalizes:

```json
{
  "intent": "choose-project-directory",
  "confidence": "high",
  "why": "The user is referring to the startup working directory.",
  "entities": {
    "projectDirectory": "current"
  },
  "requiresConfirmation": false
}
```

Example:

User types:

```text
do the next useful thing
```

CleanClaw responds:

```text
I think you want to continue the active plan.
Why: there is an in-progress plan and you asked for the next useful step.

Use this interpretation?
1. Continue active plan
2. Choose a different action
3. Cancel
```

## Implementation Phases

### Phase 1: Schema And Deterministic Shell

- Create strict intent types and validation helpers.
- Add tests for allowed / rejected intents.
- Keep deterministic menu selection first.
- No LLM calls yet.

### Phase 2: LLM Prompt Contract

- Create parser prompt builder.
- Include available menu options and current project context.
- Require JSON only.
- Require `why`.
- Require `requiresConfirmation` for medium / low confidence.
- Add snapshot-style tests for prompt shape.

### Phase 3: Local LLM Parser

- Wire parser through the existing local chat provider where possible.
- Add timeout and invalid JSON handling.
- Add deterministic fallback to the current router.
- Add tests with mocked LLM responses.

### Phase 4: Interactive Session Integration

- Use normalized intents in top-level natural language routing.
- Use normalized directory entities during project confirmation.
- Use normalized provider/model/key intents in setup prompts.
- Keep numbered choices deterministic.

### Phase 5: User-Visible Confidence

- Show interpreted action and why before acting when confidence is not high.
- Show clarifying questions for unknown / conflicting input.
- Add task log entries for interpretation decisions.

### Phase 6: Guardrail And Regression Tests

- Test invalid JSON.
- Test unsupported intent.
- Test hallucinated file changes are ignored.
- Test low confidence requires confirmation.
- Test no mutation happens during parsing.
- Test local fallback behavior.

## Open Decisions

- Should high-confidence parser results act immediately, or should first use in a session always be confirmed?
- Should local model parsing be enabled by default only after setup confirms Ollama is available?
- Should interpreted intents be logged in the task log every time, or only when they affect flow?
- Should API key phrases like "use my OpenAI key" open a secure prompt rather than accept the key inline?

## Initial Checklist

- [ ] Review and approve this plan.
- [ ] Decide confirmation behavior for high-confidence interpretations.
- [ ] Decide local-parser availability rule.
- [ ] Implement Phase 1.
- [ ] Implement Phase 2.
- [ ] Implement Phase 3.
- [ ] Implement Phase 4.
- [ ] Implement Phase 5.
- [ ] Implement Phase 6.

## Validation Plan

- Add focused unit tests for the schema, prompt contract, parser fallback, and interactive session integration.
- Run `npx.cmd vitest run cleanclaw/core/intent-schema.test.ts cleanclaw/core/intent-normalizer.test.ts cleanclaw/core/request-routing.test.ts cleanclaw/cli/interactive-session.test.ts`.
- Run `npm.cmd run build:cleanclaw`.
