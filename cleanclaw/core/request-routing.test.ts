import { describe, expect, it } from 'vitest';
import { formatRoutedRequest, routeNaturalRequest } from './request-routing.js';

describe('request routing', () => {
  it('routes project questions to read-only project-question action', () => {
    expect(routeNaturalRequest('What stack does this project use?')).toMatchObject({
      action: 'project-question',
      confidence: 'high',
    });
  });

  it('routes clear planning and review actions', () => {
    expect(routeNaturalRequest('continue with the plan').action).toBe('continue-plan');
    expect(routeNaturalRequest('please review this plan').action).toBe('review-plan');
    expect(routeNaturalRequest('cancel this task').action).toBe('cancel-task');
    expect(routeNaturalRequest('revise the task').action).toBe('revise-task');
  });

  it('returns confirmation for ambiguous or unknown requests', () => {
    expect(routeNaturalRequest('review and continue')).toMatchObject({
      action: 'confirm',
      confidence: 'medium',
    });
    expect(routeNaturalRequest('hmm')).toMatchObject({
      action: 'confirm',
      confidence: 'low',
    });
  });

  it('formats routed requests', () => {
    expect(formatRoutedRequest(routeNaturalRequest('new plan'))).toContain('Routed action: start-plan');
  });
});
