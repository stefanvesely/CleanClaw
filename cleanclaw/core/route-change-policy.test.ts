import { describe, expect, it } from 'vitest';
import {
  assertVisibleRouteChangeApproved,
  checkVisibleRouteChange,
  formatRouteSnapshot,
  type CleanClawRouteSnapshot,
} from './route-change-policy.js';

const base: CleanClawRouteSnapshot = {
  provider: 'nvidia-nim',
  model: 'nvidia/nemotron',
  gatewayMode: 'direct',
  sandboxMode: 'host-software-only',
  sandboxName: null,
};

describe('visible route change policy', () => {
  it('allows unchanged routes without approval', () => {
    expect(checkVisibleRouteChange({ before: base, after: base })).toEqual({
      allowed: true,
      changes: [],
      approvalRequired: false,
    });
  });

  it('blocks provider model gateway and sandbox changes without approval', () => {
    const after: CleanClawRouteSnapshot = {
      provider: 'openai-api',
      model: 'gpt-5.4',
      gatewayMode: 'gateway',
      sandboxMode: 'sandbox-runtime',
      sandboxName: 'demo',
    };

    expect(() => assertVisibleRouteChangeApproved({ before: base, after })).toThrow(/require approval/);
    expect(checkVisibleRouteChange({ before: base, after })).toMatchObject({
      allowed: false,
      approvalRequired: true,
      changes: [
        'provider: nvidia-nim -> openai-api',
        'model: nvidia/nemotron -> gpt-5.4',
        'gateway: direct -> gateway',
        'sandbox mode: host-software-only -> sandbox-runtime',
        'sandbox name: (none) -> demo',
      ],
    });
  });

  it('allows route changes when explicit approval text is supplied', () => {
    const after = { ...base, model: 'nvidia/new-model' };

    expect(checkVisibleRouteChange({
      before: base,
      after,
      approvalText: 'I approve the model change for this task.',
    })).toMatchObject({
      allowed: true,
      approvalRequired: true,
      approvalText: 'I approve the model change for this task.',
    });
  });

  it('formats a route snapshot for display', () => {
    expect(formatRouteSnapshot(base)).toContain('Provider: nvidia-nim');
    expect(formatRouteSnapshot(base)).toContain('Sandbox name: (none)');
  });
});
