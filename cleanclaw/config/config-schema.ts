export interface CleanClawConfig {
  provider: 'anthropic' | 'openai';
  anthropic?: {
    apiKey: string;
    model: string;
  };
  openai?: {
    apiKey: string;
    model: string;
  };
  approvalGranularity: 'per-step' | 'per-file' | 'per-change';
  logFormat: 'markdown' | 'json';
  projectName: string;
  plansDir: string;
  planPath?: string;
  stack: string;
  enableWizardDelegation?: boolean;
  projectRoots?: string[];
}
