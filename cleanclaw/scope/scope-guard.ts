import type { Bridge } from '../bridges/anthropic-bridge.js';
import type { ApprovedPlanContext, ScopeDecision } from './scope-rules.js';
import type { PrecheckInput } from './scope-precheck.js';
import { precheck } from './scope-precheck.js';
import { classify } from './scope-classifier.js';

export interface ScopeCheckInput extends PrecheckInput {
  changeDescription: string;
}

export async function checkScope(
  input: ScopeCheckInput,
  ctx: ApprovedPlanContext,
  bridge: Bridge,
): Promise<ScopeDecision> {
  // Step 1: deterministic pre-check (sync, no LLM)
  const precheckResult = precheck(input, ctx);

  if (precheckResult.resolved) {
    return {
      action: precheckResult.action!,
      category: precheckResult.category,
      inflectionPoint: precheckResult.inflectionPoint,
      rationale: precheckResult.rationale,
      ruleId: precheckResult.inflectionPoint ?? precheckResult.category ?? 'precheck',
    };
  }

  // Step 2: LLM classifier — only for ambiguous cases
  const classified = await classify(
    {
      filename: input.filename,
      diff: input.diff,
      precheckRationale: precheckResult.rationale,
      taskDescription: ctx.taskDescription,
      planContent: ctx.planContent,
    },
    bridge,
  );

  // no-parent-step inflection fires when classifier returns unmapped
  if (classified.category === 'unmapped') {
    return {
      action: 'halt-confirm',
      category: 'unmapped',
      inflectionPoint: 'no-parent-step',
      rationale: 'classifier could not map change to an approved plan step',
      ruleId: 'no-parent-step',
    };
  }

  return {
    action: classified.action,
    category: classified.category,
    rationale: `LLM classified as ${classified.category}`,
    ruleId: `classifier:${classified.category}`,
  };
}

export function formatHaltMessage(input: ScopeCheckInput, decision: ScopeDecision): string {
  return [
    '',
    'This change was not in the approved scope.',
    `  Change:   ${input.changeDescription}`,
    `  File:     ${input.filename}`,
    `  Category: ${decision.category ?? 'unknown'}`,
    `  Reason:   ${decision.rationale}`,
    `  Rule:     ${decision.ruleId}`,
    '',
    'Accept (a) / Reverse (r) / Explain (e):',
  ].join('\n');
}
