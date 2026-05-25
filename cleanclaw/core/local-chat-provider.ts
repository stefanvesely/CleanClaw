import { providerMetadata } from './provider-metadata.js';

export type LocalChatProviderId = 'vllm-local' | 'ollama-local';

export interface LocalChatProviderConfigInput {
  provider: string;
  model?: string;
  baseUrl?: string;
}

export interface LocalChatProviderConfig {
  provider: LocalChatProviderId;
  model: string;
  baseUrl: string;
  endpoint: string;
  protocol: 'openai-chat-completions';
  purpose: 'local-chat-coding';
}

export interface LocalChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LocalChatRequest {
  model: string;
  messages: LocalChatMessage[];
  temperature: number;
  stream: boolean;
}

const LOCAL_PROVIDER_IDS = new Set(['vllm-local', 'ollama-local']);

export function createLocalChatProviderConfig(
  input: LocalChatProviderConfigInput,
): LocalChatProviderConfig {
  if (!isLocalChatProvider(input.provider)) {
    throw new Error(`Local chat provider must be one of: ${Array.from(LOCAL_PROVIDER_IDS).join(', ')}`);
  }

  const metadata = providerMetadata(input.provider);
  if (!metadata) throw new Error(`Unknown local chat provider: ${input.provider}`);

  const baseUrl = trimTrailingSlash(input.baseUrl ?? metadata.defaultBaseURL ?? '');
  if (!baseUrl) throw new Error(`Local chat provider ${input.provider} is missing a base URL.`);

  return {
    provider: input.provider,
    model: input.model?.trim() || metadata.defaultModel,
    baseUrl,
    endpoint: `${baseUrl}/chat/completions`,
    protocol: 'openai-chat-completions',
    purpose: 'local-chat-coding',
  };
}

export function createLocalChatRequest(
  config: LocalChatProviderConfig,
  messages: LocalChatMessage[],
): LocalChatRequest {
  return {
    model: config.model,
    messages,
    temperature: 0.2,
    stream: false,
  };
}

function isLocalChatProvider(provider: string): provider is LocalChatProviderId {
  return LOCAL_PROVIDER_IDS.has(provider);
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}
