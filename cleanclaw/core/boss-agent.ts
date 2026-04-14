import { PlanningAgent } from './planning-agent.js';
import { writePlan } from '../plans/plan-writer.js';
import { checkScope } from '../scope/scope-guard.js';
import type { Bridge } from '../bridges/anthropic-bridge.js';
import type { ApprovedPlanContext } from '../scope/scope-rules.js';

export interface BossResult {
  planPath: string;
  planContent: string;
  taskId: string;
  variant: string;
}

export interface IterationResult {
  planPath: string;
  planContent: string;
  iterationNumber: number;
}

export class BossAgent {
  constructor(
    private planningAgent: PlanningAgent,
    private plansDir: string
  ) {}

  async run(taskDescription: string, taskId: string, variant: string): Promise<BossResult> {
    // Phase 1: Plan — delegate to planning agent, never plan inline
    console.log(`[CleanClaw] Generating plan for task ${taskId}${variant}...`);
    const planContent = await this.planningAgent.plan(taskDescription);

    // Phase 2: Write — commit plan to disk before any execution
    // An unwritten plan is a suggestion, not a commitment
    const planPath = writePlan(taskId, variant, planContent, this.plansDir);
    console.log(`[CleanClaw] Plan written: ${planPath}`);

    return { planPath, planContent, taskId, variant };
  }

  async promptNextIteration(
    taskId: string,
    variant: string,
    originalPlan: string,
    taskDescription: string,
    completedSteps: string[],
    scopeCtx: ApprovedPlanContext,
    bridge: Bridge,
    iterationNumber: number,
  ): Promise<IterationResult | null> {
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>(resolve => {
      rl.question('\nIteration complete. Generate next iteration? [y/n]: ', ans => { rl.close(); resolve(ans.trim().toLowerCase()); });
    });

    if (answer !== 'y') return null;

    // Coarse scope boundary check before generating next iteration
    const scopeDecision = await checkScope(
      { filename: '', diff: '', cumulativeChangeCount: 0, changeDescription: taskDescription, isIterationStart: true },
      scopeCtx,
      bridge,
    );

    if (scopeDecision.action === 'halt-confirm') {
      console.log(`[CleanClaw] Scope boundary check flagged before iteration ${iterationNumber}. Halting.`);
      return null;
    }

    console.log(`[CleanClaw] Generating iteration ${iterationNumber} plan...`);
    const planContent = await this.planningAgent.generateIterationPlan(originalPlan, taskDescription, completedSteps);
    const planPath = writePlan(taskId, variant, planContent, this.plansDir, iterationNumber);
    console.log(`[CleanClaw] Iteration ${iterationNumber} plan written: ${planPath}`);

    return { planPath, planContent, iterationNumber };
  }
}
