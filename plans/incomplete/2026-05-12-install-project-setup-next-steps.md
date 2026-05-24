# CleanClaw NemoClaw-Backed Coding Agent Plan

Created: 2026-05-12T19:46:59+02:00
Updated: 2026-05-13T22:00:00+02:00
Status: Incomplete

## Goal

Build CleanClaw into its own controlled coding agent that uses NemoClaw as the backing guardrail/runtime layer. CleanClaw owns the user experience, project workflow, task records, local-first model policy, stack agents, ProjectMap memory, and coding logs. NemoClaw/OpenShell backs sandbox lifecycle, credential/provider routing, permission boundaries, runtime checks, and guarded execution.

CleanClaw must feel conversational and useful, but the user must remain fully in control. The agent may inspect, summarize, plan, suggest, and draft. It must not silently execute, silently edit, silently widen scope, silently switch models, silently install dependencies, silently commit, or silently push.

## Current Local Model Reality

- CleanClaw already has local embedding support through `@xenova/transformers` and `Xenova/all-MiniLM-L6-v2`.
- CleanClaw does not yet have a full bundled local chat/coding LLM runtime.
- NemoClaw already has Ollama/vLLM local inference integration, local provider health checks, model warmup/probe helpers, and OpenShell routing.
- The local chat/coding model plan should therefore use NemoClaw-backed Ollama/vLLM first, not invent an unrelated runtime inside CleanClaw.

## Core Control Principles

- The user is the operator. CleanClaw is the assistant.
- Planning is the default. Execution requires approval.
- Every task must have an approved why before execution.
- File edits require approved file scope.
- New files or widened scope require renewed approval.
- Risky commands require approval.
- Frontier model use requires approval.
- Commit and push are separate explicit approvals.
- If CleanClaw is uncertain, blocked, or about to change phase, it stops and asks.
- Every non-trivial task writes records: plan file, task log, changelog, validation record, approval records, model-routing record, scope tree, and optional commit message.
- All project-related CleanClaw data lives inside the project repo under `.cleanclaw/`.

## Project-Local Data Layout

CleanClaw project memory must travel with the repo. Global user config may store known projects, recent paths, provider preferences, or pointers, but the project-local `.cleanclaw/` folder is the source of truth for project records.

```text
Project root
  .cleanclaw/
    settings.json
    runtime.json

    projectmap/
      manifest.json
      backend.json
      backend.vectors.json
      frontend.json
      frontend.vectors.json
      mediator.json
      mediator.vectors.json
      misc.json
      misc.vectors.json

    plans/
      incomplete/
      inprogress/
      complete/

    changelog/
      CHANGELOG.md
      entries/

    tasks/
      task-id/
        state.json
        plan.md
        scope-tree.json
        task-log.md
        validation.md
        approval-records.json
        model-routing.md
        changelog-entry.md
        optional-commit-message.md
```

## Phase 0 - Control Contract And State Machine

Goal: define the lifecycle that limits CleanClaw before any more agent-like behavior is implemented. CleanClaw can feel conversational, but it must operate inside explicit states, approvals, why-alignment checks, and NemoClaw guardrails.

Planning cannot be headless. The user is the link to the client, so the user must participate in defining and approving the why, scope, and plan before execution or headless mode is available.

### Deliverables

- [x] Add a written control contract for CleanClaw as a user-controlled coding agent.
- [x] Define task lifecycle states:
  - `intake`
  - `why_definition`
  - `scope`
  - `plan`
  - `plan_approval`
  - `file_scope_approval`
  - `execution`
  - `review_diff`
  - `validation_approval`
  - `validation`
  - `changelog`
  - `commit_approval`
  - `commit`
  - `push_approval`
  - `push`
  - `done`
- [x] Define valid state transitions.
- [x] Define blocked transitions and recovery prompts.
- [x] Define `.cleanclaw/tasks/<task-id>/state.json`.
- [x] Define append-only approval log format.
- [x] Define command risk categories.
- [x] Define model-use categories and frontier escalation gates.
- [x] Define the required why guardrail:
  - every task must answer "Why are we doing this task?"
  - CleanClaw may draft the why
  - the user must approve or edit the why
  - planning cannot proceed to execution unless the why is approved
  - plan steps, file scope, edits, validation, model escalation, and commit message must align with the why
- [x] Define why-alignment results:
  - `aligned`
  - `unclear`
  - `misaligned`
- [x] Define why-alignment behavior:
  - `aligned`: continue
  - `unclear`: alert user and ask
  - `misaligned`: block until user approves, revises why, or removes the action
- [x] Define action guard APIs:
  - `assertCanTransition`
  - `assertWhyExists`
  - `assertWhyApproved`
  - `assertWhyAligned`
  - `assertCanReadFile`
  - `assertCanEditFile`
  - `assertCanRunCommand`
  - `assertCanUseFrontierModel`
  - `assertCanCommit`
  - `assertCanPush`
  - `recordUserApproval`
  - `recordWhyAlignment`
- [x] Define what CleanClaw may do without asking.
- [x] Define what CleanClaw must never do without asking.
- [ ] Define headless mode as a special subsection, not a default mode.

### Implementation Progress

- [x] Added `cleanclaw/core/control-contract.ts` with lifecycle states, task state shape, transition checks, why checks, file/read/command/frontier/commit/push guards, approval records, and why-alignment records.
- [x] Added `cleanclaw/core/control-contract.test.ts` for the first Phase 0 guardrail test coverage.
- [x] Added `cleanclaw/core/task-records.ts` to persist project-local task state, approval records, and why-alignment records under `.cleanclaw/tasks/<task-id>/`.
- [x] Added `cleanclaw/core/task-records.test.ts` for task record persistence.
- [x] Wired `runPipeline` task startup to save `.cleanclaw/tasks/task<id>/state.json` and record approved task why when workflow answers are present.
- [x] Added `cleanclaw/core/permitted-actions.ts` with explicit `PERMITTED_WITHOUT_ASKING` and `NEVER_WITHOUT_ASKING` action policy lists.
- [x] Added frontier model purpose-specific rejection tests to `control-contract.test.ts`.

### Task State Shape

```json
{
  "taskId": "2026-05-13-001",
  "state": "plan_approval",
  "projectRoot": "D:\\Projects\\MyApp",
  "why": {
    "text": "Make setup simple enough for non-engineers to use CleanClaw safely.",
    "approved": true,
    "approvedByUserText": "yes that is the why"
  },
  "taskSummary": "Rework setup flow with numbered menus",
  "approvedFiles": [],
  "approvedCommands": [],
  "scopeTreePath": ".cleanclaw/tasks/2026-05-13-001/scope-tree.json",
  "modelPolicy": {
    "mode": "local_first",
    "frontierApprovedFor": [],
    "headless": false
  }
}
```

### Approval Records

- [x] Store the user's approval text as the source of truth for now.
- [x] Append approval records to the task approval log.
- [ ] Keep normalized approval events as a later enterprise-gateway enhancement.

```json
{
  "timestamp": "2026-05-13T10:05:00Z",
  "state": "file_scope_approval",
  "userText": "approve setup-wizard and state-manager only"
}
```

### Control Rules

- [ ] No source edits before plan approval.
- [ ] No edits outside the approved file list.
- [ ] No new files without scope re-approval.
- [ ] No dependency install, network call, service start/stop, destructive file action, commit, or push without explicit approval.
- [ ] No frontier model call without explicit approval.
- [ ] No project-root widening without explicit approval.
- [ ] No hidden provider/model/sandbox changes.
- [ ] Reads inside the active project root are allowed during scope/inspection.
- [ ] Reads outside the active project root require approval, a reason, and why alignment.
- [ ] Broad project scans should be announced and logged.
- [ ] Validation commands always require approval.
- [ ] Granular approvals are the default.
- [ ] Bundled approvals are allowed only when the exact bundle is displayed and the user explicitly chooses that bundle.

### Model Policy

- [ ] Default to local-first.
- [ ] Allow the local model to summarize, inspect, draft the why, draft the plan, suggest file scope, classify stack, and draft low-risk suggestions.
- [ ] If the local model takes too long, returns low confidence, hits a complexity threshold, or detects high-risk work, CleanClaw may ask to pass the step to a frontier reviewer model.
- [ ] The frontier model is a reviewer/policeman, not the client link.
- [ ] Frontier reviewer use requires approval unless the user has configured that phase explicitly.

### Headless Mode

- [ ] Headless mode is available only after user-approved planning.
- [ ] Headless mode requires user-approved why, plan, file scope, risk limits, validation policy, storage policy, model policy, and headless permissions.
- [ ] Headless mode requires a frontier coder role and a frontier reviewer/policeman role.
- [ ] Prefer distinct frontier model identities for coder and reviewer.
- [ ] Allow the same model for coder and reviewer only after a warning and explicit user approval.
- [ ] If the same model is used for both roles, record reduced review independence in `approval-records.json` and `model-routing.md`.
- [ ] Reviewer model checks why alignment, file scope, diff, validation, risk limits, and whether the user must be called back.
- [ ] All headless decisions are recorded.
- [ ] Headless optional permissions are explicit subsections:
  - allow validation commands
  - allow dependency install
  - allow file creation
  - allow ProjectMap update
  - allow changelog write
  - allow commit message draft
  - allow commit
  - allow push
- [ ] Default headless permissions:
  - edit files only inside approved scope
  - create files only when listed
  - run only approved validation commands
  - update ProjectMap after task completion
  - write changelog
  - prepare commit message
  - no automatic commit
  - no automatic push
- [ ] Push should remain manual at first.

### Tests

- [ ] Invalid state transitions are rejected.
- [ ] Cannot leave intake without task summary.
- [ ] Cannot leave why definition without user-approved why.
- [ ] Cannot approve plan if why is missing.
- [ ] Misaligned plan step blocks execution.
- [ ] File read inside root is allowed during scope.
- [ ] File read outside root requires approval.
- [ ] Editing before approval fails.
- [ ] Editing a file outside approved scope fails.
- [ ] Adding a new file requires scope approval.
- [ ] Validation command requires approval.
- [ ] Frontier model use is blocked until approved.
- [ ] Local timeout or complexity threshold triggers frontier-review prompt.
- [ ] Headless mode is rejected before planning is complete.
- [ ] Headless mode is rejected without coder and reviewer roles.
- [ ] Same-model headless coder/reviewer requires warning and explicit approval.
- [ ] Headless commit is rejected unless explicitly configured.
- [ ] Commit and push are blocked until approved.
- [ ] Push is rejected by default.
- [ ] Approval record stores user text.

### Exit Criteria

- CleanClaw has a written and testable control contract that every later phase plugs into.
- The task state schema is defined.
- The approval log format is defined.
- The why guardrail is defined.
- The headless subsection is defined.
- Guard APIs are specified.
- Test cases are listed clearly enough for implementation.

## Phase 1 - Project Root Attachment And Visible Workspace Scope

Goal: make the project root explicit, persistent, guarded, and visible. CleanClaw must show the user what it thinks the project is and which files are in scope before execution.

### Startup Root Flow

```text
If launched inside a project:
  CleanClaw suggests the current folder and asks the user to confirm.

If launched outside a project:
  CleanClaw asks for the project directory.

If folder discovery/scanning is needed:
  CleanClaw asks permission first.
```

### Workspace Scope Tree

Every task plan must include a visible planned scope tree, and the same tree must be stored in machine-readable task state.

```text
Root directory
  D:\Projects\CC\CleanClaw

Planned reads
  - package.json
  - cleanclaw/core/root-guard.ts
  - cleanclaw/core/file-scanner.ts

Planned edits
  - cleanclaw/core/task-state.ts
  - cleanclaw/cli/interactive-session.ts

Planned new files
  - cleanclaw/core/workspace-scope-tree.ts

Validation commands
  - npm run build:cleanclaw

Outside project root requests
  - none
```

### Deliverables

- [x] Add project path resolver for absolute paths, relative paths, `.`, and `~`.
- [x] Validate that selected directory exists, is a directory, and is writable.
- [x] Detect project markers:
  - `.git`
  - `package.json`
  - lockfiles
  - `.sln`
  - `.csproj`
  - `pyproject.toml`
  - `requirements.txt`
  - `go.mod`
  - `Cargo.toml`
  - `pom.xml`
  - `build.gradle`
  - framework config files
- [x] Show selected directory and detected markers before saving.
- [x] Persist active project root globally as a pointer only.
- [x] Persist project root in project-local CleanClaw settings.
- [x] Ensure config/state/logs load from the active project root, not accidental shell cwd.
- [x] Add `cleanclaw attach <path>`.
- [x] Update `cleanclaw status` to show active root, config path, ProjectMap status, runtime status, and guardrail status.
- [x] Refuse work outside active project root unless the user explicitly expands scope.
- [x] Create `scope-tree.json` for every task.
- [x] Render the scope tree in the plan file and terminal before execution.
- [x] Update the scope tree after root selection, scan, why approval, pre-edit, scope change, validation, and task completion.

### Implementation Progress

- [x] Added `cleanclaw/core/scope-tree.ts` with scope tree types, save/load helpers, out-of-root request capture, and human-readable formatting.
- [x] Added `cleanclaw/core/scope-tree.test.ts` for scope tree persistence, path normalization, and out-of-root detection.
- [x] Wired `runPipeline` task startup to save `.cleanclaw/tasks/task<id>/scope-tree.json` with scanned files as planned reads and confirmed files as planned edits.
- [x] Rendered the workspace scope tree during pipeline plan review before the user is asked to proceed with execution.
- [x] Added scope tree membership/update helpers and wired per-change execution to pause before adding an out-of-scope file to planned edits or planned new files.
- [x] Updated `cleanclaw status` to show the latest project-local task record state, approved-why status, and scope tree path.
- [x] Added `.cleanclaw/settings.json` project settings helpers and wired setup/switch/status to create and show project-local settings.
- [x] Added active project resolver that prefers current project settings/config markers before falling back to the global active-project pointer, then wired status, workflow scanning, and pipeline root lookups to it.
- [x] Refactored config loading to read `cleanclaw.config.json` from the resolved project root instead of import-time shell cwd.
- [x] Added `cleanclaw attach <path>` with project marker detection, selected-root output, project-local settings persistence, and global active-project pointer persistence.
- [x] Added reusable project path resolution and writable-directory validation for `cleanclaw attach <path>`.
- [x] Expanded `cleanclaw status` with active root, config path, ProjectMap status, runtime status, and guardrail status.
- [x] Resolved pipeline plans/logs, pipeline resumable state, and rollback logs from the active project root instead of shell cwd.
- [x] Resolved proposed relative file paths against the active root and added per-file execution root-guard enforcement.
- [x] Added scope tree lifecycle metadata and pipeline updates for why approval, pre-edit checks, validation planning, applied changes, scope expansion, and completion.
- [x] Added broad folder scan approval records and wired workflow scanning to ask before scanning; headless mode fails closed.

### Scope Rules

- [x] Reads inside the approved root are allowed during planning.
- [x] Edits require approved planned scope.
- [x] New files require explicit scope approval.
- [x] Any out-of-root access requires explicit approval, a reason, and why alignment.
- [x] Scope changes pause execution and update the visible tree.
- [x] Broad folder scanning must be approved, announced, and logged.

### Tests

- [x] Attaches a valid directory.
- [x] Rejects missing directory.
- [x] Rejects file path.
- [x] Rejects non-writable directory.
- [x] Loads config from active root.
- [x] Records detected markers.
- [x] Shows workspace scope tree before execution.
- [x] Blocks outside-root file scope.
- [x] Scope expansion updates the tree and requires approval.

### Exit Criteria

- CleanClaw always knows where it is allowed to work and the user can see the current planned file scope.

## Phase 2 - Interaction Model: Planning First, Then Return To Planning

Goal: `cleanclaw` with no args starts a persistent project-agent loop. It defaults to controlled planning, not blind execution, and returns to planning after each completed task.

### Agent Loop

```text
cleanclaw starts
  -> ask what task/work the user wants to do
  -> infer or question which project is relevant from the task and current folder
  -> attach or confirm project root
  -> enter planning mode
  -> define task and why
  -> infer project context
  -> show planned workspace scope
  -> create or approve plan
  -> optionally execute approved plan
  -> record plan/task log/changelog/validation
  -> return to planning mode
```

### Deliverables

- [x] Add interactive session entrypoint for `cleanclaw` with no subcommand.
- [x] Default to planning mode.
- [x] Ask for the task before assuming the current folder is the correct project.
- [x] Infer or question the project from the task, current folder, project markers, and in-progress plans.
- [x] If launched inside a detected project, ask: "Hi, I see we are in a project folder for <project>. Do you want to scope today's work in this folder?"
- [x] After project selection, search in-progress plans and ask whether to continue or start new.
- [x] For continued work, show a summary and ask whether the existing plan is still okay.
- [x] Ask for or propose the task why before scope decisions.
- [x] Use the approved why as the filter for project fit, file scope, validation, and change alignment.
- [x] Allow read-only project questions before a plan exists.
- [x] Prevent all file changes unless they belong to an approved plan.
- [x] When broad project scanning is needed, ask first and ask what should be excluded from the scan.
- [x] Prefer ProjectMap for project exploration when available.
- [x] Include requester and change beneficiary in new plan records.
- [x] Show "what CleanClaw knows" and "what CleanClaw needs confirmed" in planning output.
- [x] Map natural user requests onto planning/review actions while still showing numbered choices at decision points.
- [x] Let the user ask project questions, workflow questions, planning questions, or anything project-related.
- [x] Let the user create multiple approved plans for later execution.
- [ ] Let the user prepare multiple approved plans for headless execution.
- [ ] Support multiple plans for the same task and different tasks in a project session.
- [ ] Support low-token fix and full-fix plan variants.
- [x] Track plan statuses: draft, needs-user-review, approved, ready-for-execution, blocked, cancelled, complete.
- [x] Move completed plans into a completed folder.
- [ ] Compare plans by token cost, safety, speed, maintainability, risk, and scope size.
- [ ] Recommend a plan only when there is a clear winner; otherwise present tradeoffs and leave the choice to the user.
- [x] Create task record immediately after intake.
- [x] Create plan file before implementation.
- [x] Prevent edits while in planning states.
- [x] Always require explicit approval before the first file edit of a plan.
- [x] After first-edit approval, use the project approval-granularity setting.
- [x] Allow broader approval only when the user explicitly requests it.
- [x] Expire broader approval at the end of the current task.
- [x] After an approved change, run planned validation and inform the user of the result without asking again.
- [x] Record and summarize validation results after changes.
- [x] On validation failure, propose a fix/update plan and ask whether to update the plan.
- [x] Return validation failures to planning/update mode with the failure visible.
- [x] Support task cancellation and revision.
- [x] Support resume from task state.
- [x] After a task completes, return to planning mode by default.
- [x] Treat blocked work as an explicit blocked state and return to planning with the blocker highlighted.
- [x] Explain blockers in plain language and ask the user what to do next.
- [x] Keep task context when the next task is naturally related.
- [x] Clear or separate task context when the next task is unrelated.
- [x] Confirm context continuity when CleanClaw is uncertain whether the next task is related.

### Completed Phase 2 Implementation Notes

- [x] Wired no-arg `cleanclaw` to ask for the task before confirming the detected project.
- [x] Added confirmed-project-only in-progress plan discovery to the interactive session.
- [x] Added project intake evidence that shows why CleanClaw thinks a project is relevant, including root, resolver source, and detected project markers.
- [x] When no project is detected or the suggested project is rejected, CleanClaw asks for an explicit project directory and only proceeds after confirmation.
- [x] Added task why intake that drafts a why from the task and confirmed project, then lets the user accept it or type a replacement before plan discovery.
- [x] Added project-local interactive task records under `.cleanclaw/tasks/taskN/state.json` after task, project, and why are confirmed.
- [x] Added project-local draft plan creation for new interactive plans, including requester, beneficiary, approved why, known facts, and missing confirmations.
- [x] Added reusable why-alignment checks for proposed scope items and surfaced those checks in draft plans.
- [x] Added control-contract edit-state enforcement so file edits are blocked until execution or review-diff state.
- [x] Added first-edit approval state and edit guard enforcement before approved files can be edited.
- [x] Added approval-granularity helper and first-edit approval support for applying a saved project approval mode after the first explicit edit approval.
- [x] Added task-scoped broader approval records that require explicit user text and expire back to `per-change` when the task reaches `done`.
- [x] Added project-local validation records and a planned-validation runner that only runs already-approved validation commands and summarizes pass/fail/skipped results.
- [x] Added validation failure reports that block continuation, list failed commands, and require planning/update mode.
- [x] Added task cancellation and revision lifecycle helpers. Cancellation is terminal; revision clears execution-only approvals and returns the task to planning.
- [x] Added task-resume helpers that load the latest non-terminal task state and format visible resume context.
- [x] Added completion-to-planning helper that completes eligible tasks and returns a visible planning-mode summary.
- [x] Added blocked work state, blocker records, and plain-language blocker summaries that ask the user what to do next.
- [x] Added context-continuity helper for keep/separate/confirm decisions between consecutive tasks.
- [x] Added read-only project question mode so project questions do not create task records, plans, or execution state.
- [x] Added approved-plan records and edit guard enforcement so file changes require a concrete approved plan.
- [x] Added broad scan exclusion prompts and persisted exclusions in project-local scan approval records.
- [x] Added ProjectMap exploration source decision helper that prefers ready ProjectMap and falls back to approved scan/manual context.
- [x] Added natural request routing for planning/review actions with confirmation fallback for ambiguous input.
- [x] Expanded read-only question classification to project, workflow, approval, validation, scope, and planning questions.
- [x] Added `cleanclaw/core/plan-status.ts` with `PlanStatus` type, `readPlanStatus`, `writePlanStatus`, and `getPlanFilepath` helpers.
- [x] Added `cleanclaw/core/plan-lifecycle.ts` with `completePlan()` to move plans from inprogress to complete with status update.
- [x] Updated `listInProgressPlans` in `plan-discovery.ts` to filter out plans with terminal statuses (complete, cancelled).
- [x] Added `plan-status.test.ts`, `plan-lifecycle.test.ts`, and extended `plan-discovery.test.ts` with plan lifecycle tests.
- [x] Added approved session plan creation so multiple approved plans can sit side by side in `plans/inprogress/` without overwriting one another.

### Root Behavior

- [x] CleanClaw can launch from anywhere.
- [x] If launched inside a project, it suggests the current folder and asks the user to confirm.
- [x] If launched outside a project, it asks for the project directory.
- [ ] Folder scanning can help find projects, but only after user approval.
- [ ] Once attached, CleanClaw works naturally inside the project folder.
- [ ] The user should not need to repeatedly type `cleanclaw ...` during an active session.

### Headless Planning Behavior

- [ ] Planning cannot be headless.
- [ ] The user can create multiple approved plans for future headless execution.
- [ ] Each headless plan needs its own approved why, scope tree, risk limits, validation policy, storage policy, model policy, and stop conditions.
- [ ] Headless execution remains opt-in and requires coder/reviewer model roles.
- [ ] Headless execution can only run plans marked `ready-for-execution`.
- [ ] Headless-ready plans must be as granular as possible.
- [ ] Headless must require two model roles: coder and reviewer/planner.
- [ ] Headless coder receives only one single task at a time, not the full scope.
- [ ] Smaller code tasks can use a local model as coder.
- [ ] Local-first applies to small headless code tasks.
- [ ] Reviewer/planner can make bounded decisions from the approved why.
- [ ] Blocked headless execution highlights the blocker, allows interaction, and creates a report.
- [ ] Headless stops and reports when it cannot continue within approved plan, scope, why, model policy, validation policy, or runtime policy.
- [ ] Headless must never commit; commits remain explicit user actions outside headless execution.

### Tests

- [ ] No-arg command starts session.
- [ ] Plan-only mode never edits files.
- [ ] Execution cannot start without plan approval.
- [ ] Resume loads previous task state.
- [ ] Task completion returns to planning.
- [ ] Project questions can be answered without creating an execution task.
- [ ] Headless plan creation requires interactive planning.

### Exit Criteria

- CleanClaw can hold a controlled interactive planning session and continue working naturally after a task completes.

### Interaction Principles

- CleanClaw must always be status-aware.
- CleanClaw must prefer the path that gives the user the most information while preserving the most choices.
- CleanClaw should not claim certainty it does not have; confidence comes from clearly showing what it knows, what it inferred, and what needs user confirmation.

## Phase 3 - Numbered Menus For Non-Engineers

Goal: users do not need to type provider ids, model names, stack ids, or approval modes in normal setup. Numbered menus support the agent conversation; they do not replace natural language.

### Deliverables

- [ ] Add reusable numbered prompt helper.
- [ ] Use numbered options at clear decision points, not as the default starting point for every interaction.
- [ ] Keep normal interaction natural-language and status-aware by default.
- [ ] Use numbered menus for major choices:
  - project directory choice
  - provider
  - local model setup
  - stack confirmation/override
  - approval mode
  - sandbox/runtime mode
  - model escalation preference
  - headless setup
  - validation command approval
- [ ] Enter selects the recommended default where appropriate.
- [ ] Explain why an option is recommended.
- [ ] Advanced users can type exact ids.
- [ ] Unknown text and out-of-range numbers retry clearly.
- [ ] Menus render cleanly in PowerShell, cmd, and POSIX shells.
- [ ] Users can still type natural language at any time.
- [ ] Users can type back, cancel, or exit instead of requiring visible menu entries everywhere.
- [ ] Save user preferences per project for approval granularity, preferred plan style, runtime mode, and advanced option visibility.

### Example Top-Level Menu

```text
What do you want to do?

1. Start a new task plan
2. Ask a question about this project
3. Review existing plans
4. Continue an approved plan
5. Prepare plans for headless execution
6. View task logs, changelog, or validation records
7. Change project/settings
```

### Tests

- [ ] Valid number selects option.
- [ ] Enter selects default.
- [ ] Invalid number retries.
- [ ] Typed id fallback works.
- [ ] Natural language input routes to the nearest safe planning path with confirmation.
- [ ] Prompt output is readable in Windows shells.

### Exit Criteria

- A non-engineer can complete setup and normal planning without typing internal ids.

## Phase 4 - Stack Inference, ProjectMap, Vector DB, And Stack Agents

Goal: CleanClaw understands the project before it plans work. Stack inference uses deterministic project signals plus ProjectMap context, and ProjectMap becomes the persistent local project memory so CleanClaw does not re-scan from scratch every time.

### ProjectMap Flow

```text
Project root selected
  -> check .cleanclaw/projectmap/
  -> if fresh, reuse ProjectMap
  -> if missing or stale, ask to build/update it
  -> infer stack from files + config + ProjectMap
  -> select stack agents
  -> show detected stack and confidence
  -> ask user to confirm uncertain items
```

### Deliverables

- [ ] Add `stack-inference.ts`.
- [ ] Score detected project signals.
- [ ] Return ranked candidates with confidence, evidence, and ambiguity notes.
- [ ] Detect mixed-stack projects.
- [ ] Show best guess and evidence.
- [ ] Ask user to approve or override with a numbered menu.
- [ ] Store selected stack in project-local settings.
- [ ] Expand agent routing beyond the current stack list.
- [ ] Integrate stack inference with ProjectMap.
- [ ] Add ProjectMap freshness manifest.
- [ ] Reuse existing ProjectMap when fresh.
- [ ] Ask before building or rebuilding ProjectMap.
- [ ] Incrementally update ProjectMap after task completion.
- [ ] Make ProjectMap updater use local embedding defaults even when explicit `embeddings` config is absent.

### ProjectMap Manifest

`.cleanclaw/projectmap/manifest.json` must track:

- project root
- embedding provider
- embedding model
- indexed file list
- file modified times or content hashes
- skipped folders
- last full build time
- last incremental update time
- schema/index version
- last size
- size warning threshold
- user storage policy

### ProjectMap Storage Policy

- [ ] ProjectMap/vector files are per-project and live under `.cleanclaw/projectmap/`.
- [ ] ProjectMap is commit-eligible by default.
- [ ] If `.cleanclaw/projectmap/` is `<= 50 MB`, keep it inside the project repo and treat it as valid project memory.
- [ ] If `.cleanclaw/projectmap/` is `> 50 MB`, warn the user and show current size.
- [ ] Over 50 MB, offer numbered choices:
  - `1. Commit anyway`
  - `2. Keep locally but add/keep ignored`
  - `3. Compact/rebuild ProjectMap`
  - `4. Exclude selected folders`
- [ ] 50 MB is a default warning threshold, not a hard block.
- [ ] Headless cannot override the storage policy unless the approved headless plan includes that policy.
- [ ] Store the threshold and chosen policy in the ProjectMap manifest.

### ProjectMap Freshness Behavior

- [ ] If ProjectMap exists and manifest matches the current project state, reuse it.
- [ ] If files changed, update only changed files.
- [ ] If embedding model/provider changed, ask before rebuilding.
- [ ] If ProjectMap is missing, ask to build it.
- [ ] If ProjectMap is stale, show:
  - `1. Update changed files only`
  - `2. Rebuild full ProjectMap`
  - `3. Continue with stale ProjectMap`
  - `4. Skip ProjectMap for this task`
- [ ] After every completed task:
  - edited files are re-indexed
  - new files are added to ProjectMap
  - deleted files are removed from ProjectMap
  - vectors are updated incrementally
  - scope tree records changed files and ProjectMap update status

### Detection Signals

- Next.js: `next.config.*`, `app/`, `pages/`, React dependencies.
- React/Vite: `vite.config.*`, React dependencies.
- Vue/Nuxt: `vue`, `nuxt.config.*`.
- Angular: `angular.json`.
- .NET/Blazor: `.sln`, `.csproj`, `.razor`.
- FastAPI: `pyproject.toml`, `requirements.txt`, FastAPI dependency.
- Django: `manage.py`, Django dependency.
- Go: `go.mod`.
- Rust: `Cargo.toml`.
- Java/Spring: `pom.xml`, `build.gradle`, Spring dependencies.
- PHP/Laravel: `composer.json`, `artisan`.
- Rails: `Gemfile`, Rails dependency.
- Flutter: `pubspec.yaml`, Flutter config.
- React Native: React Native dependencies/config.

### Stack Agents

- [ ] TypeScript / JavaScript
- [ ] Node package manager
- [ ] CLI interaction
- [ ] Git and changelog
- [ ] Testing and validation
- [ ] Documentation / README
- [ ] Local LLM runtime
- [ ] Embeddings / search
- [ ] Security and permissions
- [ ] Project planning records
- [ ] React
- [ ] Next.js
- [ ] Vue
- [ ] Nuxt
- [ ] Node/Express
- [ ] Python/FastAPI
- [ ] Python/Django
- [ ] Java/Spring
- [ ] Go
- [ ] Rust
- [ ] PHP/Laravel
- [ ] Ruby/Rails
- [ ] Flutter
- [ ] React Native
- [ ] Docker / deployment
- [ ] CI/CD
- [ ] NemoClaw guardrails
- [ ] Release packaging
- [ ] Enterprise policy

### Guardrail

Stack inference must not become permission creep. Detecting a database, deployment config, or CI pipeline does not automatically allow edits there. It only helps CleanClaw plan better.

### Tests

- [ ] Fixture per stack.
- [ ] Mixed-stack fixture.
- [ ] Unknown project fallback.
- [ ] Override persists.
- [ ] Routing test per stack agent.
- [ ] Missing ProjectMap asks before build.
- [ ] Fresh ProjectMap is reused.
- [ ] Stale ProjectMap offers update/rebuild/stale/skip choices.
- [ ] Changed files update incrementally after task completion.
- [ ] New files are added to ProjectMap after task completion.
- [ ] Deleted files are removed from ProjectMap.
- [ ] ProjectMap above 50 MB triggers storage-policy prompt.
- [ ] Updater defaults to local embeddings when explicit embeddings config is missing.

### Exit Criteria

- CleanClaw can say, "This looks like X because I found Y," reuse project memory, select relevant stack agents, and keep the vector DB current without rebuilding unnecessarily.

## Phase 5 - Local LLM Runtime And Frontier Escalation

Goal: CleanClaw should feel like a coding agent, but default to local-first reasoning wherever practical. Frontier models are used only when needed, approved, or required by headless safety rules.

### Core Model Flow

```text
CleanClaw starts
  -> local embedding model supports ProjectMap/search
  -> local chat/coding model handles low-risk planning support
  -> if local model is too slow, uncertain, or task is high-risk
       ask to escalate to frontier model
  -> if headless execution is requested
       require frontier coder and reviewer roles
```

### Runtime Preference

```text
1. NemoClaw local runtime if available
2. Ollama local runtime
3. vLLM local runtime
4. configured OpenAI-compatible local endpoint
5. frontier model fallback only with approval
```

Local runtime should start only when CleanClaw runs. It should not become an always-on background service unless the user explicitly configures that later.

### Local Model Setup

Normal setup should not ask the user to choose a technical model unless needed.

```text
Set up local AI support for this project?

1. Yes, use recommended local setup
2. Use an existing local model server
3. Skip local model for now
4. Explain this first
```

Recommended defaults:

- embeddings: `Xenova/all-MiniLM-L6-v2`
- local chat/coding: NemoClaw configured local runtime if present
- fallback local server: Ollama
- model names hidden from non-engineers unless advanced mode is requested
- project-specific runtime preferences stored in `.cleanclaw/`

### Escalation Rules

CleanClaw should stay local-first, but ask to escalate when one of these is true:

- local model times out
- local model output cannot be parsed
- local model self-reports uncertainty
- reviewer disagreement occurs
- user asks for frontier help
- task is high risk
- task touches security, credentials, migration, deletion, release, CI/CD, deployment, runtime/sandbox, or broad refactors
- why alignment is unclear or disputed
- local output conflicts with approved scope
- task is being prepared for headless execution

Example prompt:

```text
Local model is unsure about this step.

Why:
  The change affects credential routing and release behavior.

Options:
  1. Ask frontier reviewer for advice
  2. Continue local-only
  3. Revise the plan
  4. Stop
```

### Reviewer / Policeman Model

For normal interactive work:

- reviewer model is optional unless risk is high
- user can request it at any time
- reviewer checks plan quality, why alignment, file scope, risks, and validation strategy

For headless work:

- reviewer role is mandatory
- coder role is mandatory
- distinct frontier model identities are recommended
- same model/provider/endpoint may be used for both roles only after warning and explicit user approval
- reviewer cannot apply edits directly
- reviewer only approves, blocks, or asks for user intervention

Same-model warning:

```text
You selected the same model for coder and reviewer.

This reduces independence because the reviewer may share the same blind spots,
reasoning style, context interpretation, and failure modes as the coder.

Options:
  1. Choose a different reviewer model
  2. Continue with same model for both roles and record this risk
  3. Disable headless mode
```

Reviewer checks:

```text
1. Does the task still match the approved why?
2. Are touched files inside approved scope?
3. Are new files explicitly allowed?
4. Are validation commands approved?
5. Are risks within headless limits?
6. Is the diff understandable?
7. Should the user be called back?
```

### Headless Safety

Headless requires:

- approved why
- approved plan
- approved visible workspace scope
- approved validation commands
- approved stop conditions
- approved storage policy
- approved model policy
- coder model role
- reviewer model role
- explicit user permission for each capability:
  - edit files
  - create files
  - run validation
  - update ProjectMap
  - write changelog
  - prepare commit message
  - commit
  - push

Default headless permissions:

```text
Edit files: allowed only inside approved scope
Create files: no, unless listed
Run validation: only approved commands
Update ProjectMap: yes, after task completion
Write changelog: yes
Prepare commit message: yes
Commit: no
Push: no
```

### Model Records

Every model decision should be recorded:

```text
.cleanclaw/tasks/task-id/
  model-routing.md
  approval-records.json
```

Records should include:

- local model used
- frontier model used
- reviewer model used
- reason for escalation
- user approval text
- model confidence substitute used
- reviewer verdict
- final route chosen
- same-model reviewer/coder warning if applicable

### Coding Constraints

- [ ] Add a dedicated model-routing layer before changing pipeline behavior.
- [ ] Do not retrofit local/frontier/reviewer routing directly into `runPipeline()`.
- [ ] Replace the single active provider assumption with model roles/policies.
- [ ] Add a local chat/coding provider abstraction; local embeddings are not enough.
- [ ] Integrate local runtime lifecycle through NemoClaw/OpenShell where possible.
- [ ] Treat confidence as a practical signal set, not a raw model score.
- [ ] Change headless so it runs only from pre-approved plans.
- [ ] Add a reviewer gate before execution, before each risky/scope-changing edit, and before headless completion.

### Tests

- [ ] Local unavailable gives clear setup guidance.
- [ ] Local runtime does not start until CleanClaw runs.
- [ ] Frontier model is blocked without approval.
- [ ] Approved frontier use is recorded.
- [ ] Local-only task never calls frontier.
- [ ] High-risk task prompts for reviewer.
- [ ] Headless mode is blocked unless coder and reviewer roles are configured.
- [ ] Same-model coder/reviewer warning is shown and recorded.
- [ ] Reviewer model can block headless execution.
- [ ] Local runtime only runs during CleanClaw session unless explicitly configured otherwise.

### Exit Criteria

- CleanClaw has explicit, user-controlled local/frontier model behavior and a model-routing layer that supports local-first planning, reviewer escalation, and guarded headless execution.

## Phase 6 - NemoClaw Guardrail Runtime Integration

Goal: CleanClaw remains its own product and command experience while using NemoClaw/OpenShell as the backing guardrail/runtime layer when available.

### Runtime Detection

At startup, CleanClaw should detect:

```text
1. Am I inside NemoClaw/OpenShell already?
2. Is a NemoClaw/OpenShell sandbox available?
3. Is there an active NemoClaw session?
4. Are local model runtimes available through NemoClaw?
5. Are provider credentials available through NemoClaw?
6. Are gateway inference routes available?
```

Then show a simple status:

```text
CleanClaw runtime:

Project root: D:\Projects\MyProject
Safety: NemoClaw sandbox available
Inference: local-first, frontier fallback configured
ProjectMap: fresh
Logs: project-local .cleanclaw/
```

### Install-Time NemoClaw Setup

During CleanClaw install/setup, CleanClaw should check whether NemoClaw/OpenShell support is available.

```text
cleanclaw setup
  -> check CleanClaw install
  -> check NemoClaw/OpenShell availability
  -> check sandbox support
  -> check local model runtime support
  -> check provider/gateway support
  -> write project-local .cleanclaw/runtime.json
  -> write user-level pointer/config only if needed
```

If NemoClaw is missing:

```text
NemoClaw/OpenShell is not available.

CleanClaw can still run in standalone mode, but sandbox/runtime protection
will be reduced.

Options:
  1. Help me install/configure NemoClaw
  2. Continue standalone
  3. Stop setup
```

If NemoClaw is installed but not running:

```text
NemoClaw is installed but not running.

Options:
  1. Start NemoClaw now
  2. Continue standalone for this session
  3. Stop
```

### Startup-Time NemoClaw Check

When the user runs `cleanclaw`, CleanClaw should check:

- Is NemoClaw installed?
- Is NemoClaw/OpenShell running?
- Is the sandbox available?
- Is the project root attached?
- Is local model runtime available?
- Is gateway/provider routing available?

If NemoClaw is expected but not running, CleanClaw should not silently degrade.

```text
NemoClaw is configured for this project but is not running.

Options:
  1. Start NemoClaw
  2. Continue standalone for this session
  3. Change runtime settings
  4. Stop
```

CleanClaw should not automatically start NemoClaw without user approval unless the user has explicitly enabled that behavior during setup.

```text
When I run cleanclaw, should CleanClaw start NemoClaw if needed?

1. Ask every time
2. Start automatically for this project
3. Never start automatically
```

Recommended default: ask every time.

### Runtime Record

```json
{
  "runtimeMode": "nemoclaw-preferred",
  "nemoRequired": false,
  "autoStartNemo": "ask",
  "lastKnownSandbox": null,
  "lastRuntimeCheck": "2026-05-13T00:00:00.000Z"
}
```

### Fallback Rule

If NemoClaw is unavailable, CleanClaw still works standalone using:

- software project root guard
- local `.cleanclaw/` records
- direct provider config
- local ProjectMap
- direct Ollama/vLLM/OpenAI-compatible endpoints when configured

It must clearly say when kernel-level sandboxing is not active.

### Guardrails To Import Or Mirror

- root boundary enforcement
- sandbox lifecycle
- provider registry
- credential registry
- gateway routing
- local LLM lifecycle
- secret redaction
- structured logging
- approval/permission records
- session identity
- execution policy
- validation command approval
- headless policy

### Integration Shape

```text
CleanClawRuntimeAdapter
  - detectRuntime()
  - getSandboxStatus()
  - getCredentialStatus()
  - getProviderRoutes()
  - getLocalModelStatus()
  - startLocalRuntimeIfApproved()
  - startNemoIfApproved()
  - runInSandboxIfApproved()
  - writeStructuredLog()
  - redactSecrets()
  - assertPolicy()
```

Implementations:

```text
StandaloneRuntimeAdapter
NemoClawRuntimeAdapter
```

CleanClaw chooses at startup:

```text
if NemoClaw/OpenShell context exists:
  use NemoClawRuntimeAdapter
else:
  use StandaloneRuntimeAdapter
```

### Runtime Health Checks

Before execution, CleanClaw should confirm:

- project root is locked
- workspace scope is approved
- why is approved
- model routing is available
- ProjectMap is ready or intentionally skipped
- sandbox state is known
- validation commands are approved
- records directory is writable

If a health check fails, CleanClaw pauses with numbered options.

### Tests

- [ ] CleanClaw detects standalone mode.
- [ ] CleanClaw detects NemoClaw-backed mode.
- [ ] Setup checks for NemoClaw/OpenShell.
- [ ] Startup checks whether NemoClaw is running.
- [ ] NemoClaw missing offers install/configure, standalone, or stop.
- [ ] NemoClaw installed but stopped offers start, standalone, or stop.
- [ ] Auto-start obeys project setting.
- [ ] Sandbox unavailable asks before host fallback.
- [ ] Missing credential stops with guidance.
- [ ] Provider route change asks.
- [ ] Secrets are not written to logs.
- [ ] Outside-root execution is blocked.

### Exit Criteria

- CleanClaw uses NemoClaw guardrails without becoming just a NemoClaw command, and it never hides runtime/sandbox degradation.

## Phase 7 - Controlled Execution Workflow

Goal: connect planning, state machine, guardrails, local/frontier model policy, ProjectMap, records, and execution into one user-controlled coding workflow.

### Approved Defaults

- [ ] Normal interactive approval defaults to `per-change`.
- [ ] Validation defaults to asking before each command.
- [ ] After successful task completion, CleanClaw returns to planning mode.
- [ ] CleanClaw always defaults to the most granular approval mode.
- [ ] CleanClaw does not automatically loosen approval based on task type, seniority, or inferred user skill.
- [ ] The user may explicitly change approval preference for the project.

Project-local approval setting:

```json
{
  "approvalGranularity": "per-file"
}
```

Approval mode change prompt:

```text
Change approval mode for this project?

Current:
  Per change

New:
  Per file

This means CleanClaw will show all proposed edits for a file together before asking.

Options:
  1. Save for this project
  2. Use once for this task only
  3. Keep per-change
```

### Execution Flow

```text
Approved plan exists
  -> show execution summary
  -> confirm current step
  -> check why alignment
  -> check file scope
  -> propose one change
  -> show diff
  -> ask approval
  -> apply approved change
  -> log decision
  -> repeat per change
  -> ask before each validation command
  -> update ProjectMap
  -> update task records/changelog
  -> return to planning mode
```

### Before Execution Starts

CleanClaw must show:

```text
Task:
  Add numbered setup menus

Why:
  Make CleanClaw usable for non-engineers while preserving user control.

Approved workspace scope:
  Root directory
    D:\Projects\CC\CleanClaw

  Planned reads
    - package.json
    - cleanclaw/cli/setup-wizard.ts

  Planned edits
    - cleanclaw/cli/setup-wizard.ts
    - cleanclaw/core/task-state.ts

  Planned new files
    - cleanclaw/core/menu-runner.ts

Approved validation:
  - npm run build:cleanclaw

Execution mode:
  Interactive, per-change approval
```

Then ask:

```text
Proceed?

1. Start execution
2. Review plan
3. Edit workspace scope
4. Edit why
5. Cancel
```

### Per-Step Control

Before each step:

- show step number
- show why alignment result
- show files involved
- show expected change type
- ask if needed

```text
Step 2 of 5:
Add numbered menu renderer.

Why alignment:
  Aligned - this makes setup usable without typing commands.

Files:
  - cleanclaw/core/menu-runner.ts

Options:
  1. Continue this step
  2. Edit this step
  3. Skip this step
  4. Stop and return to planning
```

### Per-Change Control

Before applying a change:

- show file path
- show whether file is existing or new
- show diff
- show risk level
- show why alignment
- ask approval

```text
Change proposed:
  File: cleanclaw/core/menu-runner.ts
  Type: new file
  Risk: low
  Why: aligned

Options:
  1. Apply this change
  2. Reject this change
  3. Ask reviewer
  4. Edit plan/scope
  5. Stop
```

### Scope Changes

If CleanClaw needs a file that was not approved:

```text
CleanClaw wants to add a file to scope.

Current approved scope:
  Planned edits
    - cleanclaw/cli/setup-wizard.ts

Requested addition:
  Planned new files
    - cleanclaw/core/menu-runner.ts

Reason:
  Needed to avoid duplicating menu behavior.

Why alignment:
  Aligned

Options:
  1. Approve this file for this task
  2. Approve and update plan
  3. Reject and revise step
  4. Stop
```

No silent expansion.

### Validation

Validation commands are never run silently by default.

```text
Validation command:
  npm run build:cleanclaw

Options:
  1. Run this command
  2. Skip validation and record reason
  3. Change validation command
  4. Stop
```

If validation fails:

```text
Validation failed.

Options:
  1. Let CleanClaw propose a fix plan
  2. Ask reviewer
  3. Record failure and stop
  4. Return to planning
```

### Task Completion

After each completed task, CleanClaw writes or updates:

```text
.cleanclaw/tasks/task-id/
  plan.md
  task-log.md
  validation.md
  approval-records.json
  model-routing.md
  scope-tree.json
  optional-commit-message.md

.cleanclaw/changelog/
  CHANGELOG.md
  entries/date-task-name.md

.cleanclaw/projectmap/
  manifest.json
  vector/index files
```

Then it returns to planning mode:

```text
Task complete.

1. Return to planning
2. Review task log
3. Create follow-up plan
4. Prepare headless plan from this workflow
5. Exit
```

### Headless Execution

Headless follows the same workflow, except approvals must already exist in the approved headless plan.

Headless must stop if:

- why alignment becomes unclear or misaligned
- a new file is needed but not approved
- validation command is not approved
- reviewer blocks
- ProjectMap exceeds approved storage policy
- NemoClaw/sandbox state changes
- model routing changes
- execution exceeds approved risk limits

Headless cannot improvise.

### Tests

- [ ] Execution starts only from an approved plan.
- [ ] Every edit is checked against why and scope.
- [ ] New files require approval unless already listed.
- [ ] Validation commands require approval.
- [ ] Validation asks before each command.
- [ ] Scope changes pause execution.
- [ ] Default approval granularity is per-change.
- [ ] Project-level approval preference changes only after explicit user request.
- [ ] Broader approval preference is saved in project-local settings.
- [ ] ProjectMap updates after completed task.
- [ ] Task records and changelog are written project-locally.
- [ ] After task completion, CleanClaw returns to planning mode.
- [ ] Headless execution stops instead of expanding scope.

### Exit Criteria

- CleanClaw can complete a coding task without losing user control, and the default behavior remains granular unless the user explicitly changes the project preference.

## Phase 8 - Release Gate, README, And Smoke Tests

Goal: prove the whole thing is usable and documented before release. CleanClaw is not releasable just because the code builds.

### Release Gate

Before release, CleanClaw must pass:

```text
1. Build
2. Unit tests
3. Setup smoke test
4. Interactive planning smoke test
5. Controlled execution smoke test
6. ProjectMap/vector update smoke test
7. NemoClaw runtime check smoke test
8. README review
9. Changelog review
10. Plan records review
```

### README Requirements

README top must clearly say:

```text
NOTE: CleanClaw is a test project first.
Please log improvement tickets before treating it as production-ready.
```

README should explain:

- what CleanClaw is
- what NemoClaw backing means
- how CleanClaw differs from NemoClaw
- user-control model
- why planning comes first
- local-first model policy
- frontier escalation
- ProjectMap/vector DB
- per-project `.cleanclaw/` records
- numbered menu setup
- headless restrictions
- install flow
- first project setup
- common commands
- known limitations

### Smoke Tests

- [ ] Fresh setup:
  - `cleanclaw` detects no attached project
  - asks for project directory
  - detects stack
  - asks to confirm stack
  - configures local embeddings
  - checks ProjectMap
  - asks to build ProjectMap
  - checks NemoClaw runtime
  - enters planning mode
- [ ] Planning-only task:
  - asks why
  - creates plan
  - shows workspace scope tree
  - does not edit files
  - records plan
  - returns to planning
- [ ] Controlled execution task:
  - asks why
  - creates approved plan
  - shows planned files
  - proposes diff
  - asks per-change approval
  - applies only approved change
  - asks before validation
  - writes task log
  - writes changelog
  - updates ProjectMap
  - returns to planning
- [ ] Scope expansion:
  - CleanClaw pauses
  - shows current scope
  - shows requested added file
  - asks approval
  - records approval text
  - updates scope tree
- [ ] Headless rejection:
  - CleanClaw refuses headless without approved planning
  - explains why
  - offers to create an approved plan first
- [ ] NemoClaw degraded runtime:
  - CleanClaw warns
  - offers start NemoClaw, standalone, settings, or stop
  - does not silently degrade

### Project Records Review

Release cannot pass unless a completed task contains:

```text
.cleanclaw/tasks/<task-id>/
  plan.md
  scope-tree.json
  task-log.md
  approval-records.json
  validation.md
  model-routing.md
  changelog-entry.md
```

And project-level records exist:

```text
.cleanclaw/projectmap/
.cleanclaw/changelog/
.cleanclaw/plans/
```

### Final Acceptance Criteria

- [ ] A non-engineer can install and start CleanClaw.
- [ ] CleanClaw can attach to a project and infer stack.
- [ ] CleanClaw can build/reuse ProjectMap.
- [ ] CleanClaw can run planning-first.
- [ ] CleanClaw can execute a controlled task with granular approval.
- [ ] CleanClaw returns to planning after completion.
- [ ] CleanClaw refuses unsafe headless mode.
- [ ] CleanClaw makes NemoClaw runtime status visible.
- [ ] README matches the real workflow.
- [ ] Changelog and plan records are current.

### Exit Criteria

- CleanClaw is a proper NemoClaw-backed coding agent: independent UX, local-first model policy, full NemoClaw guardrails, project-local memory, and user-controlled execution.

## Implementation Order

1. Phase 0: control state machine and approval contract.
2. Phase 1: project root attachment and visible workspace scope.
3. Phase 2: planning-first interactive loop.
4. Phase 3: numbered menus.
5. Phase 4: stack inference, ProjectMap, vector DB, and stack agents.
6. Phase 5: local LLM runtime and frontier escalation.
7. Phase 6: NemoClaw guardrail runtime integration.
8. Phase 7: controlled execution workflow.
9. Phase 8: README, release gate, and smoke tests.

## Overall Acceptance Criteria

- A fresh user can start `cleanclaw`, attach/select a project directory, accept an inferred stack, configure local-first model behavior, and begin planning without manually editing config.
- CleanClaw defaults to planning and user approval before execution.
- Normal setup uses numbered menus; typed ids remain available for advanced users.
- The selected project root, stack, provider, approval mode, local model policy, runtime policy, ProjectMap policy, and embedding settings persist project-locally.
- CleanClaw refuses unapproved edits, unapproved scope widening, unapproved frontier model use, unapproved risky commands, unapproved commits, and unapproved pushes.
- CleanClaw writes plan file, task log, changelog, validation record, approval records, model-routing record, visible scope tree, and optional commit message for non-trivial work.
- ProjectMap is reused when fresh, incrementally updated after task completion, and stored per project.
- At least 10 new stack agents are routed by inference and covered by tests.
- README documents the final flow, guardrails, and test-project/improvement-ticket note.
