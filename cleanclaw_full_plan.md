# CleanClaw
### *Clean output. Clear intent. Every time.*

---

## Strategic Overview

CleanClaw is a structured AI workflow tool that makes developer output auditable, consistent, and human-approved. It is being built in three stages: open source validation, seed funding, and enterprise scale.

The open source version builds credibility and userbase. The enterprise version is the trust infrastructure around it — audit guarantees, SLAs, managed infrastructure, compliance documentation, and human approval chains with legal weight. That cannot be self-hosted or reverse engineered. That is what enterprises pay for.

---

## The Full Arc

| Stage | What it is | Goal |
|---|---|---|
| Phase 1 | Open source, BYOK, free | Validate the workflow. Build userbase. Collect evidence. |
| Seed Round | Investor raise | Fund the enterprise build properly |
| Phase 2 | Managed enterprise platform | Reliability layer for AI at scale |

---

## Key Strategic Decisions

**Open source stays.** Moving fast is the answer to reverse engineering risk, not closing the source. Open source builds the community and evidence needed for funding.

**BYOK for Phase 1, managed keys for Phase 2.** Users bring their own API keys in Phase 1. In Phase 2 CleanClaw holds the keys, manages the infrastructure, and provides the guarantees enterprises need.

**Two providers only in Phase 1.** Anthropic and OpenAI. Mistral and local model support deferred — not needed for validation.

**No config screen in Phase 1.** Developers edit config directly as JSON. Full config UI deferred to Phase 2.

**Sales come last.** No enterprise sales until the enterprise product is ready. The sequence is: traction → funding → build → sell.

**Funding ask is specific.** The raise funds backend infrastructure, security audit, compliance layer, and the team to build it properly. Not to validate the idea — Phase 1 already does that.

---

## Phase 1 — Open Source Validation

**Goal:** Prove the workflow is valuable. Build a userbase. Collect the evidence needed for a seed raise.

**Timeline:** 6 build weekends + 1 launch weekend

**Revenue:** None

---

### Feature Set

**Core Workflow**
- Boss agent — orchestration, task routing, and plan file creation
- Planning agent — structured plan before any code is written
- Language specific agent — stack aware implementation (.NET, Svelte, Angular, Blazor)
- Verification layer — WHY summaries captured at each approval event

**Plan & Log System**
- Boss/Planner agent creates plan file before execution begins
- Plan file is never modified after creation — record of intent
- Log file appended on each approval event — record of reality
- Literal code diffs with line numbers (Before/After) — no prose descriptions
- WHY summary written at point of approval, not after
- Task variants (A, B, C...) for afterthoughts and out-of-scope work
- Scope boundary defined in every plan — anything outside becomes a new variant
- Approval granularity configurable: per-step, per-file, or per-change (default: per-file)

**Folder Structure per Task**
```
/plans/
  /task55/
    task55A_plan.md
    task55A_log.md
    task55B_plan.md
    task55B_log.md
```

**Plan File Format**
```markdown
# Task55A

## Objective
What this task is trying to achieve, in plain language.

## Steps
1. Step description — file(s) expected to change
2. Step description — file(s) expected to change

## Scope Boundary
What is explicitly out of scope for this task.
Anything outside this boundary becomes a new variant.
```

**Log File Format — appended per approval event**
```markdown
## Change 1

**Filename:** src/core/pipeline.ts

**Before (lines 12-18):**
```
12: original code line
13: original code line
```

**After (lines 12-18):**
```
12: new code line
13: new code line
```

**Why:**
Agent reasoning for this change, written at point of approval.

---
```

**ContextClaw — CLI Project Switching**
- Work from command prompt anywhere on the machine
- Switch projects by prompt
- Plans, logs, and state saved per project
- Context restored instantly on switch

**Multi Provider — BYOK**
- Anthropic — Claude Haiku, Sonnet, Opus
- OpenAI — GPT-4o, GPT-4 mini
- User adds their own API keys on setup

**Setup Wizard**
- Single install command
- Guided key configuration
- First project setup
- Done in under 10 minutes

---

### Weekend Build Plan

**Weekend 1 — Foundation**
- Fork NemoClaw, get it running locally
- Set up TypeScript project structure
- Write core interfaces and config schema
- First bridge call working end to end

*Milestone: NemoClaw responding through your bridge*

**Weekend 2 — Core Pipeline**
- Build pipeline.ts middleware structure
- Boss agent — orchestration and plan file creation
- Planning agent — structured markdown output
- Wire together with state passing between steps

*Milestone: Boss routes to planning agent, plan file produced and saved*

**Weekend 3 — Language Agent and Approval Handler**
- Language specific agent with stack context
- Approval event handler
- Log file writer — appends on each approval

*Milestone: Approval events firing, log file being written*

**Weekend 4 — Diff Capture and Verification**
- Literal diff capture — reads actual file state before change
- Before/After with line numbers
- WHY summary attached at approval point
- Full pipeline end to end tested with a real coding task

*Milestone: Full workflow running, plan and log files produced correctly*

**Weekend 5 — Multi Provider and Config**
- Anthropic bridge
- OpenAI bridge
- Agent router reading config and routing correctly
- BYOK setup
- Approval granularity setting

*Milestone: Same task running on different providers, log output identical in structure*

**Weekend 6 — CLI and Project Switching**
- State manager — save and load project context including /plans folder
- switch-project.sh and switch-project.ts
- Command prompt anywhere working
- Install script

*Milestone: Switching projects from anywhere, context and plans restored*

**Weekend 7 — Polish and Launch**
- End to end testing across all four stacks
- README and install documentation
- Setup wizard for new users
- Screen capture demo — plan file created, work executed, log file produced
- GitHub repository public
- LinkedIn article, Reddit, Hacker News Show HN

*Milestone: Real developers using it and telling you what is wrong*

---

### Folder Structure

```
/stefan-workflow/
  /src
    /core
      pipeline.ts
      boss-agent.ts
      planning-agent.ts
      language-agent.ts
      verification-layer.ts
      state-manager.ts
      config-loader.ts
      config-merger.ts
      agent-router.ts
    /plans
      plan-writer.ts
      log-writer.ts
      diff-capture.ts
      variant-manager.ts
    /bridges
      anthropic-bridge.ts
      openai-bridge.ts
    /cli
      run-workflow.sh
      switch-project.sh
      setup-wizard.ts
      install.sh
    /config
      default-config.json
      config-schema.ts
  /tests
  README.md
  package.json
  tsconfig.json
```

---

### Phase 1 Success Criteria

These are the metrics that unlock the seed raise conversation:

- 50+ developers have installed and used it
- At least 10 have used it for real work, not just testing
- Clear feedback on what they wish it did
- At least 2-3 have asked about a paid or managed version
- Evidence of the accountability use case — feedback mentioning audit, consistency, reliability, or team trust
- The most common stack configurations are understood

The last two are the seed story. Every developer who says "I wish I could show this to my team" or "this would solve our audit problem" is a data point for investors.

---

## Seed Round

**Trigger:** Phase 1 success criteria met

**Thesis:** AI adoption is accelerating but enterprise governance of AI output is nonexistent. CleanClaw is the reliability layer for an unreliable technology in a regulated world. Open source traction proves demand. The enterprise layer — audit guarantees, SLAs, compliance documentation, managed infrastructure — cannot be self-hosted or replicated without the platform.

**The ask funds:**
- Proper backend infrastructure
- Security audit
- Compliance layer
- Team to build Phase 2 properly

**Not funding validation.** Phase 1 already did that.

**Investor conversation angles:**
- Anthropic and OpenAI partnership — both have an enterprise problem. Their models are powerful but customers cannot prove to auditors what the model did, when, and why a human approved it. CleanClaw is that missing layer.
- Regulatory tailwind — AI governance requirements are coming. CleanClaw is infrastructure, not a feature.

---

## Phase 2 — CleanClaw Enterprise Platform

**Goal:** Managed multi-tenant platform with per seat pricing

**Timeline:** 8-10 weekends after funding, built properly with a team

**Revenue:** Per seat subscription

---

### What Changes

One fundamental shift: **CleanClaw takes over the API keys.**

Users authenticate to the platform. CleanClaw routes to providers on their behalf. They never deal with Anthropic or OpenAI directly. Everything else is additive on top of Phase 1.

---

### Feature Set

**Managed Key Infrastructure**
- CleanClaw holds Anthropic and OpenAI keys
- Customer authenticates with platform key
- Usage tracked per seat per team
- Soft usage caps to protect margins
- Automatic fallback if a provider is down

**Audit and Compliance Layer**
- Plan and log files stored and signed on the platform
- Timestamped approval chain with user identity attached
- Exportable audit report per project
- Retention policies per team
- Legal weight — not just a local markdown file

**Team Management**
- Team admin account
- Seat management — invite, remove, manage members
- Team wide config applied to all seats
- Individual overrides within team config
- Usage dashboard per team

**Per Seat Billing via Stripe**
- Starter: 1-5 seats at $45/seat/month
- Team: 6-20 seats at $38/seat/month
- Business: 21-50 seats at $30/seat/month
- Enterprise: 50+ seats, custom pricing
- Automatic invoicing
- Usage overage handling

**Enhanced Agent Selection**
- Admin picks agents per workflow step for the whole team
- Optional individual member overrides
- Fallback provider per step
- Cost optimisation suggestions

**Usage and Analytics Dashboard**
- Tokens used per seat per month
- Cost breakdown by provider and agent type
- Most used workflow steps
- Performance comparison across providers
- Export for internal reporting

**Self Serve Onboarding**
- Sign up and create team
- Add seats and invite members
- Configure agents and stack preferences
- Billing setup
- Live in under 15 minutes

---

### Revenue Projection

| Teams | Avg Seats | Price/Seat | Monthly Revenue | Margin (~50%) |
|---|---|---|---|---|
| 5 | 10 | $38 | $1,900 | $950 |
| 10 | 15 | $38 | $5,700 | $2,850 |
| 20 | 15 | $38 | $11,400 | $5,700 |
| 50 | 20 | $34 | $34,000 | $17,000 |

---

## Complete Timeline

| Stage | Activity | Time |
|---|---|---|
| Phase 1 Build | 7 weekends | Months 1-2 |
| Phase 1 Validate | Active feedback collection | Month 3 |
| Seed Round | Raise on traction | Months 4-5 |
| Hiring | Backend, security, compliance team | Months 6-8 |
| Phase 2 Build | Funded, full team | Months 9-12 |
| Phase 2 Launch | Enterprise sales begins | Month 13 |

---

---

## Investor & Partner Targets

> Verify current investment status, batch dates, and contacts before approaching.

---

### Approach Strategy

Sequence matters. Do not approach everyone at once — build credibility in layers.

1. **Apply to AI Grant and Microsoft for Startups first** — low friction, fast, non-dilutive. Gets resources and credibility before traction.
2. **Approach Anthropic and OpenAI startup programs** once Phase 1 has real usage numbers.
3. **Apply to YC or Techstars** with Phase 1 evidence behind you. A working product with real users is a significantly stronger application than a plan.
4. **Use accelerator network** to warm-intro VCs for the full seed round.

---

### Tier 1 — Strategic Partners

**Anthropic**
CleanClaw solves a real enterprise adoption problem Anthropic faces — customers want Claude but can't justify it to compliance teams. CleanClaw makes Claude enterprise-deployable. Angle is distribution and partnership first, funding second.
- Anthropic Startup Program — anthropic.com/startups
- Partnerships team via enterprise contact form
- Warm intro via Claude developer community

**OpenAI**
Same logic. Provider-agnostic tool that makes GPT-4 output auditable is valuable to their enterprise sales motion.
- OpenAI Startup Fund — openai.com/fund
- OpenAI for Startups program

**Microsoft**
Owns GitHub Copilot. Has the largest enterprise sales motion in the industry. CleanClaw's audit and compliance layer maps directly onto what Microsoft's enterprise customers are asking for around AI governance. Angle is distribution via GitHub and Azure channels.
- Microsoft for Startups Founders Hub — foundershub.startups.microsoft.com
- GitHub Next team — githubnext.com
- Azure Marketplace partnership program

**GitHub**
Where Phase 1 users live. GitHub Next actively invests in and promotes developer tools that extend the AI coding workflow.
- GitHub Next — open to project submissions
- GitHub Accelerator — runs annually

---

### Tier 2 — Accelerators

**Y Combinator (Global)**
Most valuable brand in early stage. Strong enterprise software and developer tools alumni network. Two batches per year — Winter and Summer. $500k for 7%. Remote-friendly.
- ycombinator.com/apply
- Apply with Phase 1 traction if possible

**Techstars (Global)**
Sector-specific programs globally. Future of Work and enterprise software programs are directly relevant. More accessible than YC, strong corporate partner relationships. $120k for 6%.
- techstars.com/programs — filter by enterprise/AI

**Entrepreneur First (London, Berlin, Bangalore, Toronto, NYC)**
Backs individual founders before the company is fully formed. Relevant if co-founders or technical hires are part of the plan.
- ef.co — cohort-based, twice a year per city

**Antler (Global — 30+ cities)**
Most geographically broad early stage accelerator. Pre-seed focus, $250k-$500k typical first check. Rolling applications.
- antler.co

**AI Grant (Global, Remote)**
Specifically funds AI-native products. Small grants ($10k-$50k), low dilution, fast process. Community and signal value is disproportionate to the dollar amount. Strong fit for Phase 1 bridge.
- aigrant.org

---

### Tier 3 — Enterprise AI VCs (Seed Round Stage)

For reference when the accelerator network opens these conversations.

| Firm | Location | Why Relevant |
|---|---|---|
| Sequoia | US/Global | Active in AI infra and developer tools |
| Andreessen Horowitz (a16z) | US | Large AI fund, enterprise software focus |
| Index Ventures | London/SF | Strong enterprise SaaS track record |
| Balderton Capital | London | Leading UK/EU enterprise software investor |
| Notion Capital | London | Enterprise SaaS specialists, EU focus |
| Accel | US/London/India | Developer tools and enterprise software |

---

### The Pitch That Works For All Of Them

AI adoption is accelerating but enterprise governance of AI output is nonexistent. CleanClaw is the audit and reliability layer that makes AI-assisted development acceptable to compliance teams, CTOs, and boards. Open source traction proves demand. The enterprise platform is the business.

---

## The North Star

Phase 1 proves the workflow is valuable.
The seed round funds building it properly.
Phase 2 makes it a business that enterprises depend on.

Do not rush the raise. The stronger Phase 1 traction is, the better the terms. Every week of real usage makes the enterprise thesis less risky and more fundable.
