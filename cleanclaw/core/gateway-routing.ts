import type { CleanClawConfig } from '../config/config-schema.js';
import type { CleanClawRuntimeContext } from './runtime-context.js';
import { providerMetadata } from './provider-metadata.js';

export type GatewayRoutingMode = 'auto' | 'gateway' | 'direct';

export interface GatewayRoutingOptions {
  mode?: GatewayRoutingMode;
  runtimeContext?: CleanClawRuntimeContext | null;
}

const GATEWAY_OPENAI_BASE_URL = 'https://inference.local/v1';
const GATEWAY_ANTHROPIC_BASE_URL = 'https://inference.local';
const GATEWAY_PROVIDER_MODEL_PREFIX = 'inference/';

const ANTHROPIC_PROVIDERS = new Set([
  'anthropic',
  'anthropic-prod',
  'compatible-anthropic-endpoint',
]);

const LOCAL_PROVIDERS = new Set([
  'vllm-local',
  'ollama-local',
]);

function shouldUseGateway(config: CleanClawConfig, options: GatewayRoutingOptions): boolean {
  if (options.mode === 'gateway') return true;
  if (options.mode === 'direct') return false;
  if (LOCAL_PROVIDERS.has(config.provider)) return false;

  const context = options.runtimeContext;
  if (!context) return false;
  return context.source.startsWith('nemoclaw') || Boolean(context.blueprint.gatewayName);
}

function gatewayModel(model: string | null | undefined, fallback: string): string {
  const resolved = model || fallback;
  return resolved.startsWith(GATEWAY_PROVIDER_MODEL_PREFIX)
    ? resolved
    : `${GATEWAY_PROVIDER_MODEL_PREFIX}${resolved}`;
}

function openAiModel(config: CleanClawConfig): string {
  return config.openai?.model ?? providerMetadata(config.provider)?.defaultModel ?? 'gpt-5.4';
}

function anthropicModel(config: CleanClawConfig): string {
  return config.anthropic?.model ?? providerMetadata(config.provider)?.defaultModel ?? 'claude-sonnet-4-6';
}

export function applyGatewayRoutingPolicy(
  config: CleanClawConfig,
  options: GatewayRoutingOptions = {},
): CleanClawConfig {
  if (!shouldUseGateway(config, options)) return config;

  if (ANTHROPIC_PROVIDERS.has(config.provider)) {
    return {
      ...config,
      anthropic: {
        ...config.anthropic,
        apiKey: config.anthropic?.apiKey ?? '',
        model: gatewayModel(config.anthropic?.model, anthropicModel(config)),
        baseURL: GATEWAY_ANTHROPIC_BASE_URL,
      },
    };
  }

  return {
    ...config,
    openai: {
      ...config.openai,
      apiKey: config.openai?.apiKey ?? '',
      model: gatewayModel(config.openai?.model, openAiModel(config)),
      baseURL: GATEWAY_OPENAI_BASE_URL,
    },
  };
}

export function describeGatewayRouting(
  config: CleanClawConfig,
): { mode: 'gateway' | 'direct'; baseURL: string | null; model: string | null } {
  if (ANTHROPIC_PROVIDERS.has(config.provider)) {
    return {
      mode: config.anthropic?.baseURL ? 'gateway' : 'direct',
      baseURL: config.anthropic?.baseURL ?? null,
      model: config.anthropic?.model ?? null,
    };
  }

  return {
    mode: config.openai?.baseURL === GATEWAY_OPENAI_BASE_URL ? 'gateway' : 'direct',
    baseURL: config.openai?.baseURL ?? null,
    model: config.openai?.model ?? null,
  };
}
