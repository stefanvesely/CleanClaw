import type { CleanClawConfig } from '../config/config-schema.js';

export function mergeConfigs(
  globalConfig: Partial<CleanClawConfig>,
  projectConfig: Partial<CleanClawConfig>,
): CleanClawConfig {
  return {
    ...globalConfig,
    ...projectConfig,
    anthropic: { ...globalConfig.anthropic, ...projectConfig.anthropic },
    openai: { ...globalConfig.openai, ...projectConfig.openai },
  } as CleanClawConfig;
}
