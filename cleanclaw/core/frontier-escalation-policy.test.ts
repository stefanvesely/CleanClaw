import { describe, expect, it } from 'vitest';
import {
  createFrontierEscalationPrompt,
  evaluateFrontierEscalation,
} from './frontier-escalation-policy.js';

describe('frontier escalation policy', () => {
  it('keeps local handling when no escalation signal exists', () => {
    const decision = evaluateFrontierEscalation({
      localTimedOut: false,
      localConfidence: 'high',
      complexity: 'simple',
      risk: 'low',
    });

    expect(decision).toEqual({
      escalationRecommended: false,
      reasons: [],
    });
    expect(createFrontierEscalationPrompt(decision)).toBeNull();
  });

  it('recommends frontier review when local model times out or confidence is low', () => {
    const decision = evaluateFrontierEscalation({
      localTimedOut: true,
      localConfidence: 'low',
      complexity: 'simple',
      risk: 'low',
    });

    expect(decision.escalationRecommended).toBe(true);
    expect(decision.reasons).toEqual([
      'local model timed out',
      'local confidence is low',
    ]);
    expect(createFrontierEscalationPrompt(decision)?.defaultId).toBe('ask-frontier-reviewer');
  });

  it('recommends frontier review for high complexity or high risk', () => {
    const decision = evaluateFrontierEscalation({
      localConfidence: 'medium',
      complexity: 'complex',
      risk: 'high',
    });

    expect(decision.reasons).toEqual([
      'task complexity is high',
      'task risk is high',
    ]);
    expect(createFrontierEscalationPrompt(decision)?.options.map(option => option.id)).toEqual([
      'ask-frontier-reviewer',
      'keep-local',
      'stop-and-plan',
    ]);
  });

  it('derives escalation from practical confidence signals', () => {
    const decision = evaluateFrontierEscalation({
      confidenceSignals: [
        {
          id: 'project',
          label: 'Project confirmed',
          status: 'confirmed',
          reason: 'User confirmed the project.',
        },
        {
          id: 'designs',
          label: 'Designs missing',
          status: 'blocked',
          reason: 'Jacob has not supplied designs.',
        },
      ],
      complexity: 'moderate',
      risk: 'medium',
    });

    expect(decision).toEqual({
      escalationRecommended: true,
      reasons: ['local confidence is low'],
    });
  });
});
