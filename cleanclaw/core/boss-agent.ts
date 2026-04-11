import { PlanningAgent } from './planning-agent.js';
import { writePlan } from '../plans/plan-writer.js';

export interface BossResult {
  planPath: string;
  planContent: string;
  taskId: string;
  variant: string;
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
}
