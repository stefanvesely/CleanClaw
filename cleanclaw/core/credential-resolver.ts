import fs from 'fs';
import os from 'os';
import path from 'path';
import type { CleanClawConfig } from '../config/config-schema.js';
import {
  CLEANCLAW_PROVIDER_METADATA,
  knownProviderIds,
  providerMetadata,
} from './provider-metadata.js';

export const PROVIDER_CREDENTIAL_ENV: Record<string, string> = Object.fromEntries(
  Object.values(CLEANCLAW_PROVIDER_METADATA).map(provider => [provider.id, provider.credentialEnv]),
);

const ALLOWED_CREDENTIAL_KEYS = new Set(Object.values(PROVIDER_CREDENTIAL_ENV));
const MAX_LEGACY_CREDENTIAL_BYTES = 1024 * 1024;

type Env = NodeJS.ProcessEnv;

interface ResolveOptions {
  env?: Env;
  homeDir?: string;
}

export interface CredentialResolution {
  config: CleanClawConfig;
  credentialEnv: string;
  credentialValue: string | null;
}

function normalizeCredential(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.replace(/\r/g, '').trim();
  return normalized || null;
}

function legacyCredentialPath(homeDir: string): string {
  return path.join(homeDir, '.nemoclaw', 'credentials.json');
}

function readLegacyCredentials(homeDir: string): Record<string, string> {
  const filepath = legacyCredentialPath(homeDir);
  let stat: fs.Stats;
  try {
    stat = fs.statSync(filepath);
  } catch {
    return {};
  }

  if (!stat.isFile() || stat.size > MAX_LEGACY_CREDENTIAL_BYTES) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    return {};
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!ALLOWED_CREDENTIAL_KEYS.has(key) || typeof value !== 'string') continue;
    const normalized = normalizeCredential(value);
    if (normalized) result[key] = normalized;
  }
  return result;
}

export function credentialEnvForProvider(provider: string): string | null {
  return providerMetadata(provider)?.credentialEnv ?? null;
}

export function resolveProviderCredential(envName: string, options: ResolveOptions = {}): string | null {
  const env = options.env ?? process.env;
  const existing = normalizeCredential(env[envName]);
  if (existing) return existing;

  const homeDir = options.homeDir ?? env.HOME ?? os.homedir();
  const legacyValue = normalizeCredential(readLegacyCredentials(homeDir)[envName]);
  if (legacyValue) {
    env[envName] = legacyValue;
    return legacyValue;
  }

  return null;
}

export function resolveConfigCredential(
  config: CleanClawConfig,
  options: ResolveOptions = {},
): CredentialResolution {
  const credentialEnv = credentialEnvForProvider(config.provider);
  const metadata = providerMetadata(config.provider);
  if (!credentialEnv) {
    throw new Error(
      `Unknown provider "${config.provider}". Known providers: ${knownProviderIds().join(', ')}`,
    );
  }

  const configuredValue = metadata?.bridgeFamily === 'anthropic'
    ? normalizeCredential(config.anthropic?.apiKey)
    : normalizeCredential(config.openai?.apiKey);
  const credentialValue = configuredValue ?? resolveProviderCredential(credentialEnv, options);

  if (!credentialValue) {
    return { config, credentialEnv, credentialValue: null };
  }

  if (metadata?.bridgeFamily === 'anthropic') {
    return {
      config: {
        ...config,
        anthropic: {
          model: metadata.defaultModel,
          ...config.anthropic,
          apiKey: credentialValue,
        },
      },
      credentialEnv,
      credentialValue,
    };
  }

  return {
    config: {
      ...config,
      openai: {
        model: metadata?.defaultModel ?? 'gpt-5.4',
        ...config.openai,
        apiKey: credentialValue,
      },
    },
    credentialEnv,
    credentialValue,
  };
}
