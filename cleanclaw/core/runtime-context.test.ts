import { describe, expect, it } from 'vitest';
import {
  buildCleanClawRuntimeContext,
  formatRuntimeContextMarkdown,
  summarizeRuntimeContext,
} from './runtime-context.js';
import type { CleanClawConfig } from '../config/config-schema.js';

const config: CleanClawConfig = {
  provider: 'nvidia-nim',
  openai: {
    apiKey: '<REDACTED>',
    model: 'nvidia/nemotron-3-super-120b-a12b',
  },
  approvalGranularity: 'per-change',
  logFormat: 'markdown',
  projectName: 'CleanClaw',
  plansDir: './plans',
  stack: 'dotnet',
};

describe('CleanClaw runtime context', () => {
  it('summarizes NemoClaw session metadata without credential values', () => {
    const context = buildCleanClawRuntimeContext({
      source: 'nemoclaw-mode',
      config,
      activeRoot: 'D:/Projects/CC/CleanClaw',
      credentialEnv: 'OPENAI_API_KEY',
      hasCredential: true,
      session: {
        sessionId: 'session-1',
        agent: 'openclaw',
        sandboxName: 'demo-sandbox',
        provider: 'nvidia-nim',
        model: 'nvidia/nemotron-3-super-120b-a12b',
        endpointUrl: 'https://example.test/v1?token=sk-123456789012345678901234',
        preferredInferenceApi: 'openai-completions',
        policyPresets: ['npm', 'pypi'],
        metadata: { gatewayName: 'nemoclaw', fromDockerfile: 'Dockerfile' },
      },
    });

    const summary = summarizeRuntimeContext(context);

    expect(summary).toMatchObject({
      source: 'nemoclaw-mode',
      sessionId: 'session-1',
      gatewayName: 'nemoclaw',
      provider: 'nvidia-nim',
      credentialEnv: 'OPENAI_API_KEY',
      preferredInferenceApi: 'openai-completions',
      policyPresets: ['npm', 'pypi'],
      hasCredential: true,
    });
    expect(context.auth.endpointUrl).not.toContain('sk-123456789012345678901234');
  });

  it('formats a markdown block for task logs', () => {
    const context = buildCleanClawRuntimeContext({
      source: 'cleanclaw-cli',
      config,
      credentialEnv: 'OPENAI_API_KEY',
      hasCredential: false,
    });

    const markdown = formatRuntimeContextMarkdown(context);

    expect(markdown).toContain('## Runtime Context');
    expect(markdown).toContain('- Source: cleanclaw-cli');
    expect(markdown).toContain('- Credential present: no');
  });
});
