import { describe, expect, it } from 'vitest';
import { resolveModelRolePolicy } from './model-role-policy.js';

describe('model role policy', () => {
  it('fills planner and coder from the default provider while keeping roles explicit', () => {
    const decision = resolveModelRolePolicy({
      defaultProvider: 'openai-api',
      defaultModel: 'gpt-5.4',
    });

    expect(decision.valid).toBe(true);
    expect(decision.routes.map(route => route.role)).toEqual(['planner', 'coder']);
    expect(decision.routes[0]).toMatchObject({
      role: 'planner',
      provider: 'openai-api',
      model: 'gpt-5.4',
    });
  });

  it('requires a reviewer role when review is required', () => {
    const decision = resolveModelRolePolicy({
      defaultProvider: 'openai-api',
      defaultModel: 'gpt-5.4',
      requireReviewer: true,
    });

    expect(decision.valid).toBe(false);
    expect(decision.missing).toEqual(['reviewer role']);
  });

  it('accepts distinct coder and reviewer routes', () => {
    const decision = resolveModelRolePolicy({
      defaultProvider: 'openai-api',
      defaultModel: 'gpt-5.4',
      requireReviewer: true,
      routes: [
        {
          role: 'coder',
          provider: 'openai-api',
          model: 'gpt-5.4',
          reason: 'Frontier coder for approved task.',
        },
        {
          role: 'reviewer',
          provider: 'anthropic-prod',
          model: 'claude-sonnet-4-6',
          reason: 'Independent reviewer for risky changes.',
        },
      ],
    });

    expect(decision.valid).toBe(true);
    expect(decision.missing).toEqual([]);
    expect(decision.routes.map(route => route.role)).toEqual(['coder', 'reviewer', 'planner']);
  });

  it('requires local roles to use local providers', () => {
    const decision = resolveModelRolePolicy({
      defaultProvider: 'openai-api',
      defaultModel: 'gpt-5.4',
      routes: [
        {
          role: 'local-coder',
          provider: 'openai-api',
          model: 'gpt-5.4',
          reason: 'Incorrect local route.',
        },
      ],
    });

    expect(decision.valid).toBe(false);
    expect(decision.missing).toContain('local-coder must use a local provider');
  });

  it('allows local coder and embedding roles through local providers', () => {
    const decision = resolveModelRolePolicy({
      defaultProvider: 'openai-api',
      defaultModel: 'gpt-5.4',
      routes: [
        {
          role: 'local-coder',
          provider: 'ollama-local',
          model: 'nemotron-3-nano:30b',
          reason: 'Small local coding task.',
        },
        {
          role: 'embedding',
          provider: 'vllm-local',
          model: 'local-embedding',
          reason: 'Project vector search.',
        },
      ],
    });

    expect(decision.valid).toBe(true);
    expect(decision.missing).toEqual([]);
  });

  it('blocks frontier default routes in local-only mode', () => {
    const decision = resolveModelRolePolicy({
      defaultProvider: 'openai-api',
      defaultModel: 'gpt-5.4',
      localOnly: true,
    });

    expect(decision.valid).toBe(false);
    expect(decision.missing).toEqual([
      'planner must stay local in local-only mode',
      'coder must stay local in local-only mode',
    ]);
  });

  it('allows all-local routes in local-only mode', () => {
    const decision = resolveModelRolePolicy({
      defaultProvider: 'ollama-local',
      defaultModel: 'nemotron-3-nano:30b',
      localOnly: true,
      routes: [
        {
          role: 'reviewer',
          provider: 'vllm-local',
          model: 'local-reviewer',
          reason: 'Local reviewer for local-only task.',
        },
      ],
    });

    expect(decision.valid).toBe(true);
    expect(decision.missing).toEqual([]);
  });
});
