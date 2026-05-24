export interface PlanComparisonInput {
  id: string;
  label: string;
  tokenCost: number;
  safety: number;
  speed: number;
  maintainability: number;
  risk: number;
  scopeSize: number;
}

export interface PlanComparisonResult extends PlanComparisonInput {
  score: number;
  tradeoffs: string[];
}

export function comparePlans(plans: PlanComparisonInput[]): PlanComparisonResult[] {
  return plans
    .map(plan => ({
      ...plan,
      score: scorePlan(plan),
      tradeoffs: describeTradeoffs(plan),
    }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
}

export function scorePlan(plan: PlanComparisonInput): number {
  return (
    normalizePositive(plan.safety) +
    normalizePositive(plan.speed) +
    normalizePositive(plan.maintainability) +
    normalizeNegative(plan.tokenCost) +
    normalizeNegative(plan.risk) +
    normalizeNegative(plan.scopeSize)
  ) / 6;
}

export function formatPlanComparison(results: PlanComparisonResult[]): string {
  if (results.length === 0) {
    return 'No plans available to compare.';
  }

  return results.map((plan, index) => [
    `${index + 1}. ${plan.label}`,
    `   Score: ${plan.score.toFixed(2)}`,
    `   Token cost: ${plan.tokenCost}`,
    `   Safety: ${plan.safety}`,
    `   Speed: ${plan.speed}`,
    `   Maintainability: ${plan.maintainability}`,
    `   Risk: ${plan.risk}`,
    `   Scope size: ${plan.scopeSize}`,
    '   Tradeoffs:',
    ...plan.tradeoffs.map(tradeoff => `   - ${tradeoff}`),
  ].join('\n')).join('\n\n');
}

function describeTradeoffs(plan: PlanComparisonInput): string[] {
  const tradeoffs: string[] = [];

  if (plan.tokenCost >= 7) tradeoffs.push('Higher token cost.');
  if (plan.tokenCost <= 3) tradeoffs.push('Lower token cost.');
  if (plan.risk >= 7) tradeoffs.push('Higher implementation risk.');
  if (plan.risk <= 3) tradeoffs.push('Lower implementation risk.');
  if (plan.scopeSize >= 7) tradeoffs.push('Broader scope.');
  if (plan.scopeSize <= 3) tradeoffs.push('Smaller scope.');
  if (plan.maintainability >= 7) tradeoffs.push('Better long-term maintainability.');
  if (plan.speed >= 7) tradeoffs.push('Faster expected delivery.');
  if (plan.safety >= 7) tradeoffs.push('Stronger safety posture.');

  return tradeoffs.length > 0 ? tradeoffs : ['Balanced tradeoff profile.'];
}

function normalizePositive(value: number): number {
  return clamp(value) / 10;
}

function normalizeNegative(value: number): number {
  return 1 - (clamp(value) / 10);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(10, value));
}
