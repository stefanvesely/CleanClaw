import { describe, expect, it, vi } from 'vitest';
import {
  buildCleanClawSandboxExecPlan,
  executeCleanClawInSandbox,
  isRunningInsideSandbox,
  resolveCleanClawSandboxName,
} from './sandbox-runtime.js';
import { buildCleanClawRuntimeContext } from './runtime-context.js';
import type { CleanClawConfig } from '../config/config-schema.js';

const config: CleanClawConfig = {
  provider: 'nvidia-nim',
  openai: { apiKey: 'key', model: 'nvidia/nemotron-3-super-120b-a12b' },
  approvalGranularity: 'per-change',
  logFormat: 'markdown',
  projectName: 'CleanClaw',
  plansDir: './plans',
  stack: 'dotnet',
};

describe('CleanClaw sandbox runtime', () => {
  it('detects when CleanClaw is already running inside the sandbox', () => {
    expect(isRunningInsideSandbox({ CLEANCLAW_IN_SANDBOX: '1' })).toBe(true);
    expect(isRunningInsideSandbox({ CLEANCLAW_IN_SANDBOX: '0' })).toBe(false);
  });

  it('resolves sandbox name from runtime context before env fallbacks', () => {
    const runtimeContext = buildCleanClawRuntimeContext({
      source: 'nemoclaw-mode',
      config,
      session: { sandboxName: 'from-session' },
    });

    expect(resolveCleanClawSandboxName(runtimeContext, { NEMOCLAW_SANDBOX: 'from-env' })).toBe('from-session');
    expect(resolveCleanClawSandboxName(null, { NEMOCLAW_SANDBOX_NAME: 'from-env-name' })).toBe('from-env-name');
  });

  it('builds a safe openshell sandbox exec plan', () => {
    const plan = buildCleanClawSandboxExecPlan({
      sandboxName: 'demo',
      projectRoot: "/work/project with ' quote",
      taskDescription: "fix Bob's task",
      headless: true,
    });

    expect(plan.args.slice(0, 6)).toEqual(['sandbox', 'exec', '--name', 'demo', '--', 'sh']);
    expect(plan.command).toContain("CLEANCLAW_IN_SANDBOX=1");
    expect(plan.command).toContain("--headless");
    expect(plan.command).toContain("'fix Bob'\\''s task'");
  });

  it('executes through the resolved openshell binary when available', async () => {
    const spawn = vi.fn(() => ({ status: 0 })) as unknown as typeof import('node:child_process').spawnSync;

    const result = await executeCleanClawInSandbox(
      {
        sandboxName: 'demo',
        projectRoot: '/work/project',
        taskDescription: 'fix it',
      },
      {
        openshellBin: '/usr/bin/openshell',
        spawn,
        stdio: 'pipe',
      },
    );

    expect(result).toMatchObject({ attempted: true, delegated: true, sandboxName: 'demo', status: 0 });
    expect(spawn).toHaveBeenCalledWith(
      '/usr/bin/openshell',
      expect.arrayContaining(['sandbox', 'exec', '--name', 'demo']),
      expect.objectContaining({ cwd: expect.stringContaining('/work/project') }),
    );
  });
});
