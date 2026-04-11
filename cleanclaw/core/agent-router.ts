import type { CleanClawConfig } from "../config/config-schema.js";
import type { Bridge } from "../bridges/anthropic-bridge.js";
import type { LanguageAgent } from "./language-agent.js";
import { AnthropicBridge } from "../bridges/anthropic-bridge.js";
import { OpenAiBridge } from "../bridges/openai-bridge.js";
import { DotnetAgent } from "../agents/dotnet-agent.js";
import { SvelteAgent } from "../agents/svelte-agent.js";
import { AngularAgent } from "../agents/angular-agent.js";
import { BlazorAgent } from "../agents/blazor-agent.js";

export function resolveBridge(config: CleanClawConfig): Bridge {
  if (config.provider === "openai") {
    const apiKey = config.openai?.apiKey || "";
    const model = config.openai?.model || "gpt-4o";
    return new OpenAiBridge(apiKey, model);
  }
  if (config.provider === "anthropic") {
    const apiKey = config.anthropic?.apiKey || "";
    const model = config.anthropic?.model || "claude-sonnet-4-6";
    return new AnthropicBridge(apiKey, model);
  }
  throw new Error(`Unsupported provider: ${config.provider}`);
}

export function resolveLanguageAgent(config: CleanClawConfig): LanguageAgent {
  const agents: Record<string, LanguageAgent> = {
    dotnet: new DotnetAgent(),
    svelte: new SvelteAgent(),
    angular: new AngularAgent(),
    blazor: new BlazorAgent(),
  };

  const agent = agents[config.stack];
  if (!agent) {
    throw new Error(`No language agent for stack: "${config.stack}". Supported: ${Object.keys(agents).join(', ')}`);
  }
  return agent;
}
