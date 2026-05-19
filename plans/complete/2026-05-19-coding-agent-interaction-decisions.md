# Coding Agent Interaction Decisions

Created: 2026-05-19T00:00:00+02:00
Status: Complete
Completed: 2026-05-19T00:00:00+02:00

## Goal

Work through the coding-agent behavior decisions before implementing Phase 2.

## Why

This is the area that shapes how CleanClaw feels and behaves. The defaults must inspire confidence by showing what CleanClaw knows, what it does not know, and what choices the user controls.

## Guiding Principle

CleanClaw should choose the path that gives the user the most information while preserving the most user control. Confidence comes from "I know": visible project context, visible task context, visible plan state, visible choices, and no hidden assumptions.

## Checklist

- [x] Decide no-arg `cleanclaw` session startup behavior.
- [x] Decide planning-first mode behavior.
- [x] Decide return-to-planning loop behavior.
- [x] Decide multiple-plan behavior.
- [x] Decide execution-control behavior.
- [x] Decide numbered-menu/non-engineer UX behavior.
- [x] Decide headless planning/execution behavior.
- [x] Update master plan with all accepted decisions.

## Validation Plan

- Planning record only for now.
- Implementation validation will be defined per build slice.

## Item 1 - No-Arg `cleanclaw` Session

Decision:

- `cleanclaw` must first ask what task/work the user wants to do.
- After hearing the task, CleanClaw infers or questions which project is relevant.
- This must work even when the user starts CleanClaw from the wrong folder.
- If CleanClaw detects the current folder is a project, it should say: "Hi, I see we are in a project folder for <project>. Do you want to scope today's work in this folder?"
- After project selection, CleanClaw searches for in-progress plans.
- If in-progress plans exist, CleanClaw asks whether to continue or start new.
- New work triggers the full scope questions.
- Continuing work shows a summary and asks: "Is this still okay?"
- The session must always be status-aware.
- CleanClaw should inspire confidence by showing what it knows and by giving the user choices.

## Item 2 - Planning-First Mode

Decision:

- CleanClaw asks for or supplies the why before scope decisions.
- CleanClaw may propose a why and ask the user to confirm or correct it.
- Example pattern: "We are using potatoes because we are making chips. Is that why correct?"
- The why becomes the filter for task fit, file scope, validation, and whether a proposed change still aligns.
- CleanClaw can answer project questions before a plan exists.
- Project-question mode is read-only exploration, not execution.
- CleanClaw cannot change files unless the change belongs to an approved plan.
- Project exploration should prefer ProjectMap when available.
- If broad scanning is needed, CleanClaw must ask first and include an exclusion question: "I need to scan the project. Is there anything I don't need to scan?"
- Specific file reads inside the active root are allowed during planning, but broad scans and out-of-root reads need approval.
- A new plan must show:
  - task summary
  - why
  - who requested it
  - who the change is for
  - inferred project
  - planned reads
  - planned edits
  - planned new files
  - validation commands
  - risks and assumptions
  - what CleanClaw knows
  - what CleanClaw needs the user to confirm
- Planning/reviewing should not depend on rigid commands only. CleanClaw should find natural similarities between what the user says and the available planning/review paths, while still showing numbered choices when a decision point exists.

## Item 3 - Return-To-Planning Loop

Decision:

- Blocked work must become an explicit blocked state, not a vague failure.
- CleanClaw should highlight the blocker in plain language and ask what the user wants to do next.
- Example pattern: "We are currently blocked by Jacob not supplying designs. What should we do?"
- After a blocked state, CleanClaw returns to planning mode with the blocker visible.
- CleanClaw should keep the same task context while the next work is naturally related.
- Example: first task is login, next task is storing cached login data, so keep context.
- CleanClaw should clear or separate context when the next task is not meaningfully related.
- Example: first task is login, next task is invoice export, so start a clean context.
- Context continuity should be inferred but confirmed when uncertain.

## Item 4 - Multiple Plans

Decision:

- Multiple plans are allowed for the same task and for different tasks in the same project session.
- For the same task, the key variants should normally be cost/control variants:
  - low-token fix
  - full fix
- This is especially useful when the user is restricted on tokens or wants to choose between quick containment and full repair.
- Every plan should have a status.
- Accepted statuses:
  - draft
  - needs-user-review
  - approved
  - ready-for-execution
  - blocked
  - cancelled
  - complete
- Completed plans must be migrated into a completed folder.
- CleanClaw should compare plans for:
  - low-token vs high-token/full-fix cost
  - safety
  - speed
  - maintainability
  - risk
  - scope size
- CleanClaw can recommend a plan only when there is a clear winner.
- If there is no clear winner, CleanClaw must present the tradeoffs and leave the choice to the user.

## Item 5 - Execution Control

Decision:

- CleanClaw must always require explicit user approval before the first file edit of a plan.
- After first-edit approval, approval granularity follows the user's project setting.
- Default project setting remains granular unless the user explicitly changes it.
- Broader approval is allowed only when the user requests it.
- Examples:
  - approve all edits in this file
  - approve this step
  - approve formatting-only changes
- Broader approval expires after the current task.
- Validation failures should not trigger automatic repair.
- If validation fails, CleanClaw proposes a fix/update plan and asks the user whether to update the plan.
- Validation failure returns to planning/update mode with the failure visible.

- After an approved change, CleanClaw should run the planned validation and inform the user of the result.
- Validation after a change does not require a separate approval prompt.
- Validation results must be recorded and summarized.

## Item 6 - Numbered Menus / Non-Engineer UX

Decision:

- Numbered menus should appear at clear decision points, not as the default starting point for every interaction.
- Example decision point: "Which step should we work on?"
- CleanClaw remains natural-language and status-aware by default.
- Enter may select a recommended default where a safe recommendation exists.
- CleanClaw should explain why an option is recommended.
- Users can always type natural language instead of a number.
- Menus do not need visible Back/Cancel/Exit entries everywhere; users can type those intents.
- User preferences can be saved per project for now.
- Project preferences can include:
  - approval granularity
  - preferred plan style
  - runtime mode
  - advanced option visibility

## Item 7 - Headless Planning And Execution

Decision:

- Headless execution can only run plans marked `ready-for-execution`.
- Headless-ready plans must be as granular as possible.
- Headless always requires two model roles:
  - coder
  - reviewer/planner
- The coder must not receive the full scope.
- The coder receives only one single task at a time.
- Local and frontier models can be paired.
- For smaller code tasks, the local model can act as coder.
- Local-first applies for small code tasks.
- The reviewer/planner can use the plan why to make bounded decisions.
- If headless is blocked, CleanClaw must highlight the blocker and allow interaction.
- The reviewer/planner may make choices based on the approved why, but must produce a final report.
- Headless must stop and report when it cannot continue inside the approved plan, scope, why, model policy, validation policy, or runtime policy.
- Headless must never commit.
- Commits remain an explicit user action outside headless execution.
