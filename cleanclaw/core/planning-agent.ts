import type { Bridge } from '../bridges/anthropic-bridge.js';

const PLAN_SYSTEM_PROMPT = `You are a software planning agent for CleanClaw — an audit trail and human approval layer for AI-assisted development. Your users are developers and vibecoders who need explicit control over every change made to their codebase.

When given a task description, produce a plan in this exact markdown format:

# Task[ID]

## Objective
[One paragraph describing what the task achieves and why it matters to the developer. Be specific — name the files or systems involved.]

## Steps
1. [Specific action] — [exact file(s) expected to change]
2. [Specific action] — [exact file(s) expected to change]
3. [Specific action] — [exact file(s) expected to change]

## Scope Boundary
[What is explicitly out of scope for this task. Always include at least one item. This is the line the developer has agreed not to cross without a new task.]

Rules:
- Steps must name specific files, not vague areas ("update UserService.cs", not "update the service layer")
- Each step must be independently approvable — one logical change per step
- The Scope Boundary must be honest — if something is tempting to add but not requested, name it here
- Never include test files, smoke tests, CI configuration, or infrastructure changes unless the task description explicitly asks for them
- Respond only with the markdown. No preamble, no explanation, no code fences around the markdown.
- If the task description includes a 'Files confirmed:' section, treat those as the only files in scope for this plan — do not reference or modify any other files.`;

export class PlanningAgent {
  constructor(private bridge: Bridge) {}

  async plan(taskDescription: string): Promise<string> {
    const response = await this.bridge.send(
      [{ role: 'user', content: taskDescription }],
      PLAN_SYSTEM_PROMPT
    );

    return response.content;
  }

  async generateIterationPlan(
    originalPlan: string,
    taskDescription: string,
    completedSteps: string[],
  ): Promise<string> {
    const completedList = completedSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const prompt = `Original task: ${taskDescription}\n\nOriginal plan:\n${originalPlan}\n\nCompleted steps:\n${completedList}\n\nGenerate the next iteration plan for remaining or follow-up work.`;
    const response = await this.bridge.send(
      [{ role: 'user', content: prompt }],
      PLAN_SYSTEM_PROMPT
    );
    return response.content;
  }
}
