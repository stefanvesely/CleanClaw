import type { PlanComparisonResult } from './plan-comparison.js';

export interface PlanRecommendation {
  hasClearWinner: boolean;
  recommended?: PlanComparisonResult;
  reason: string;
}

const DEFAULT_CLEAR_WINNER_GAP = 0.15;

export function recommendPlan(
  comparedPlans: PlanComparisonResult[],
  clearWinnerGap = DEFAULT_CLEAR_WINNER_GAP,
): PlanRecommendation {
  if (comparedPlans.length === 0) {
    return {
      hasClearWinner: false,
      reason: 'No plans are available to recommend.',
    };
  }

  if (comparedPlans.length === 1) {
    return {
      hasClearWinner: true,
      recommended: comparedPlans[0],
      reason: 'Only one plan is available.',
    };
  }

  const [first, second] = comparedPlans;
  const gap = first.score - second.score;

  if (gap >= clearWinnerGap) {
    return {
      hasClearWinner: true,
      recommended: first,
      reason: `${first.label} is clearly ahead by ${gap.toFixed(2)} points.`,
    };
  }

  return {
    hasClearWinner: false,
    reason: `No clear winner: top plans are only ${gap.toFixed(2)} points apart.`,
  };
}

export function formatPlanRecommendation(recommendation: PlanRecommendation): string {
  if (recommendation.hasClearWinner && recommendation.recommended) {
    return [
      `Recommended: ${recommendation.recommended.label}`,
      `Reason: ${recommendation.reason}`,
      'Tradeoffs:',
      ...recommendation.recommended.tradeoffs.map(tradeoff => `- ${tradeoff}`),
    ].join('\n');
  }

  return [
    'No recommendation.',
    `Reason: ${recommendation.reason}`,
    'Review the tradeoffs and choose the plan you want CleanClaw to follow.',
  ].join('\n');
}
