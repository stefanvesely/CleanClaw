# Startup LLM Sanity Check

Created: 2026-05-25T00:00:00+02:00
Status: in-progress

## Why

CleanClaw must not pretend to be a coding agent unless at least one local model can answer and frontier model availability is known. The first startup step should prove model reality before project planning begins.

## Checklist

- [x] Create a review-only startup process skeleton with empty methods.
- [x] Add an inert main startup method that shows method order and decision branches.
- [ ] Add a real chat-completion sanity probe for local and frontier routes.
- [ ] Make `cleanclaw` run the sanity check before the interactive planning loop.
- [ ] Require a working local model before planning.
- [ ] Prompt for local setup or network local model details when local is missing.
- [ ] Prompt for frontier API keys, test them immediately, and save only working keys.
- [ ] Add focused tests.
- [ ] Validate with focused tests and build.

## Validation Plan

- Run focused tests for the new sanity module.
- Run interactive-session/numbered prompt tests for regressions.
- Run `npm.cmd run build:cleanclaw`.
