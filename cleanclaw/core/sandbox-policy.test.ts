import { describe, expect, it } from 'vitest';
import { evaluateRootPolicy } from './sandbox-policy.js';

describe('CleanClaw sandbox policy', () => {
  it('reports host software-only mode when OpenShell is unavailable', () => {
    expect(evaluateRootPolicy({
      activeRoot: '/repo',
      openshellAvailable: false,
      inSandbox: false,
    })).toMatchObject({
      mode: 'host-software-only',
      landlock: 'unavailable',
    });
  });

  it('reports sandbox-capable host mode when OpenShell is available', () => {
    expect(evaluateRootPolicy({
      activeRoot: '/repo',
      openshellAvailable: true,
      inSandbox: false,
      sandboxName: 'demo',
    })).toMatchObject({
      mode: 'host-sandbox-available',
      sandboxName: 'demo',
      landlock: 'unavailable',
    });
  });

  it('reports sandbox runtime mode when running inside OpenShell', () => {
    expect(evaluateRootPolicy({
      activeRoot: '/repo',
      openshellAvailable: true,
      inSandbox: true,
      sandboxName: 'demo',
    })).toMatchObject({
      mode: 'sandbox-runtime',
      sandboxName: 'demo',
      landlock: 'available',
    });
  });
});
