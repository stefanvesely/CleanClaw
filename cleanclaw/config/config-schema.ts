export interface CustomAgentConfig {
  stack: string;
  systemPrompt: string;
}

export interface CleanClawConfig {
  provider:
    | 'anthropic'
    | 'openai'
    | 'nvidia-nim'
    | 'nvidia-prod'
    | 'anthropic-prod'
    | 'openai-api'
    | 'compatible-anthropic-endpoint'
    | 'compatible-endpoint'
    | 'vllm-local'
    | 'ollama-local';
  anthropic?: {
    apiKey: string;
    model: string;
  };
  openai?: {
    apiKey: string;
    model: string;
    baseURL?: string;
  };
  approvalGranularity: 'per-step' | 'per-file' | 'per-change';
  logFormat: 'markdown' | 'json';
  projectName: string;
  plansDir: string;
  planPath?: string;
  stack: string;
  enableWizardDelegation?: boolean;
  projectRoots?: string[];
  embeddings?: {
    provider?: string;
    model?: string;
    apiKey?: string;
    baseUrl?: string;
  };
  projectMap?: {
    enabled: boolean;
  };
  layerMap?: Record<string, string>;
  layerKeywords?: Record<string, string[]>;
  customAgents?: CustomAgentConfig[];
}
