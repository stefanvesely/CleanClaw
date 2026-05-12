import type { CleanClawConfig } from '../config/config-schema.js';

export type CleanClawProvider = CleanClawConfig['provider'];

export type ProviderBridgeFamily = 'anthropic' | 'openai';

export interface CleanClawProviderMetadata {
  id: CleanClawProvider;
  label: string;
  bridgeFamily: ProviderBridgeFamily;
  credentialEnv: string;
  defaultModel: string;
  defaultBaseURL?: string;
  wizardVisible: boolean;
}

export const NEMOCLAW_PROVIDER_IDS = [
  'nvidia-nim',
  'nvidia-prod',
  'openai-api',
  'anthropic-prod',
  'compatible-anthropic-endpoint',
  'compatible-endpoint',
  'vllm-local',
  'ollama-local',
] as const satisfies readonly CleanClawProvider[];

export const CLEANCLAW_PROVIDER_METADATA: Record<CleanClawProvider, CleanClawProviderMetadata> = {
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic (legacy alias)',
    bridgeFamily: 'anthropic',
    credentialEnv: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-sonnet-4-6',
    wizardVisible: false,
  },
  openai: {
    id: 'openai',
    label: 'OpenAI (legacy alias)',
    bridgeFamily: 'openai',
    credentialEnv: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o',
    wizardVisible: false,
  },
  'nvidia-nim': {
    id: 'nvidia-nim',
    label: 'NVIDIA Endpoints',
    bridgeFamily: 'openai',
    credentialEnv: 'OPENAI_API_KEY',
    defaultModel: 'nvidia/nemotron-3-super-120b-a12b',
    defaultBaseURL: 'https://integrate.api.nvidia.com/v1',
    wizardVisible: true,
  },
  'nvidia-prod': {
    id: 'nvidia-prod',
    label: 'NVIDIA Endpoints (prod alias)',
    bridgeFamily: 'openai',
    credentialEnv: 'OPENAI_API_KEY',
    defaultModel: 'nvidia/nemotron-3-super-120b-a12b',
    defaultBaseURL: 'https://integrate.api.nvidia.com/v1',
    wizardVisible: false,
  },
  'anthropic-prod': {
    id: 'anthropic-prod',
    label: 'Anthropic',
    bridgeFamily: 'anthropic',
    credentialEnv: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-sonnet-4-6',
    wizardVisible: true,
  },
  'openai-api': {
    id: 'openai-api',
    label: 'OpenAI',
    bridgeFamily: 'openai',
    credentialEnv: 'OPENAI_API_KEY',
    defaultModel: 'gpt-5.4',
    wizardVisible: true,
  },
  'compatible-anthropic-endpoint': {
    id: 'compatible-anthropic-endpoint',
    label: 'Other Anthropic-compatible endpoint',
    bridgeFamily: 'anthropic',
    credentialEnv: 'COMPATIBLE_ANTHROPIC_API_KEY',
    defaultModel: 'custom-anthropic-model',
    wizardVisible: true,
  },
  'compatible-endpoint': {
    id: 'compatible-endpoint',
    label: 'Other OpenAI-compatible endpoint',
    bridgeFamily: 'openai',
    credentialEnv: 'COMPATIBLE_API_KEY',
    defaultModel: 'custom-model',
    wizardVisible: true,
  },
  'vllm-local': {
    id: 'vllm-local',
    label: 'Local vLLM',
    bridgeFamily: 'openai',
    credentialEnv: 'NEMOCLAW_VLLM_LOCAL_TOKEN',
    defaultModel: 'vllm-local',
    defaultBaseURL: 'http://localhost:8000/v1',
    wizardVisible: true,
  },
  'ollama-local': {
    id: 'ollama-local',
    label: 'Local Ollama',
    bridgeFamily: 'openai',
    credentialEnv: 'NEMOCLAW_OLLAMA_PROXY_TOKEN',
    defaultModel: 'nemotron-3-nano:30b',
    defaultBaseURL: 'http://localhost:11434/v1',
    wizardVisible: true,
  },
};

export const CLEANCLAW_WIZARD_PROVIDER_IDS = Object.values(CLEANCLAW_PROVIDER_METADATA)
  .filter(provider => provider.wizardVisible)
  .map(provider => provider.id);

export function providerMetadata(provider: string): CleanClawProviderMetadata | null {
  return CLEANCLAW_PROVIDER_METADATA[provider as CleanClawProvider] ?? null;
}

export function knownProviderIds(): string[] {
  return Object.keys(CLEANCLAW_PROVIDER_METADATA);
}
