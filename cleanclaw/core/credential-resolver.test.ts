import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { CleanClawConfig } from '../config/config-schema.js';
import {
  credentialEnvForProvider,
  resolveConfigCredential,
  resolveProviderCredential,
} from './credential-resolver.js';

describe('credential resolver', () => {
  let tmpHome: string;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-creds-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  function config(provider: CleanClawConfig['provider']): CleanClawConfig {
    return {
      provider,
      approvalGranularity: 'per-file',
      logFormat: 'markdown',
      projectName: 'test-project',
      plansDir: './plans',
      stack: 'dotnet',
    };
  }

  it('maps NemoClaw provider ids to credential env vars', () => {
    expect(credentialEnvForProvider('nvidia-nim')).toBe('OPENAI_API_KEY');
    expect(credentialEnvForProvider('anthropic-prod')).toBe('ANTHROPIC_API_KEY');
    expect(credentialEnvForProvider('compatible-endpoint')).toBe('COMPATIBLE_API_KEY');
  });

  it('resolves credentials from env first', () => {
    const env = { OPENAI_API_KEY: '  from-env\n' };
    expect(resolveProviderCredential('OPENAI_API_KEY', { env, homeDir: tmpHome })).toBe('from-env');
  });

  it('stages allowlisted legacy credentials when env is missing', () => {
    const credsDir = path.join(tmpHome, '.nemoclaw');
    fs.mkdirSync(credsDir, { recursive: true });
    fs.writeFileSync(
      path.join(credsDir, 'credentials.json'),
      JSON.stringify({ OPENAI_API_KEY: 'from-file', NODE_OPTIONS: '--bad' }),
    );
    const env: NodeJS.ProcessEnv = {};

    expect(resolveProviderCredential('OPENAI_API_KEY', { env, homeDir: tmpHome })).toBe('from-file');
    expect(env.OPENAI_API_KEY).toBe('from-file');
    expect(env.NODE_OPTIONS).toBeUndefined();
  });

  it('injects OpenAI-compatible credentials into config.openai', () => {
    const resolved = resolveConfigCredential(config('nvidia-nim'), {
      env: { OPENAI_API_KEY: 'nim-key' },
      homeDir: tmpHome,
    });

    expect(resolved.credentialEnv).toBe('OPENAI_API_KEY');
    expect(resolved.config.openai?.apiKey).toBe('nim-key');
    expect(resolved.config.openai?.model).toBe('nvidia/nemotron-3-super-120b-a12b');
  });

  it('injects Anthropic-compatible credentials into config.anthropic', () => {
    const resolved = resolveConfigCredential(config('compatible-anthropic-endpoint'), {
      env: { COMPATIBLE_ANTHROPIC_API_KEY: 'anthropic-key' },
      homeDir: tmpHome,
    });

    expect(resolved.credentialEnv).toBe('COMPATIBLE_ANTHROPIC_API_KEY');
    expect(resolved.config.anthropic?.apiKey).toBe('anthropic-key');
  });
});


