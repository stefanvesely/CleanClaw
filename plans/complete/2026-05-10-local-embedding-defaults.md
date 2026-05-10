# Local Embedding Defaults

Created: 2026-05-10
Completed: 2026-05-10
Status: Complete

## Assumptions

- `config.projectMap.enabled` controls whether ProjectMap is queried.
- Missing `config.embeddings` should mean local embeddings, not disabled embeddings.
- The setup wizard should guide new users toward local embeddings by default.

## Checklist

- [x] Change embedding provider fallback from OpenAI to local.
- [x] Allow ProjectMap query to run when embeddings config is omitted.
- [x] Update setup wizard prompt/default to local embeddings.
- [x] Add focused tests for provider fallback and ProjectMap query behavior.
- [x] Run available validation or document why it could not be run.
- [x] Update incomplete-work index and changelog.

## Validation

- `node --check bin/cleanclaw.js` passed.
- Focused Vitest and TypeScript validation could not be run because `npm` is not on PATH and `node_modules` is absent.
