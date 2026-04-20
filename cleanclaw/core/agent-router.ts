import type { CleanClawConfig } from "../config/config-schema.js";
import type { Bridge } from "../bridges/anthropic-bridge.js";
import type { LanguageAgent } from "./language-agent.js";
import { GenericAgent } from "./language-agent.js";
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
  if (config.provider === "openai-api") {
    const apiKey = config.openai?.apiKey || "";
    const model = config.openai?.model || "gpt-5.4";
    return new OpenAiBridge(apiKey, model);
  }
  if (config.provider === "anthropic") {
    const apiKey = config.anthropic?.apiKey || "";
    const model = config.anthropic?.model || "claude-sonnet-4-6";
    return new AnthropicBridge(apiKey, model);
  }
  if (config.provider === "anthropic-prod") {
    const apiKey = config.anthropic?.apiKey || "";
    const model = config.anthropic?.model || "claude-sonnet-4-6";
    return new AnthropicBridge(apiKey, model);
  }
  if (config.provider === "nvidia-nim" || config.provider === "nvidia-prod") {
    const apiKey = config.openai?.apiKey || "";
    const model = config.openai?.model || "nvidia/nemotron-3-super-120b-a12b";
    return new OpenAiBridge(apiKey, model, "https://inference.local/v1");
  }
  if (config.provider === "compatible-anthropic-endpoint") {
    const apiKey = config.anthropic?.apiKey || "";
    const model = config.anthropic?.model || "custom-anthropic-model";
    return new AnthropicBridge(apiKey, model);
  }
  if (config.provider === "compatible-endpoint") {
    const apiKey = config.openai?.apiKey || "";
    const model = config.openai?.model || "custom-model";
    const baseURL = config.openai?.baseURL;
    return new OpenAiBridge(apiKey, model, baseURL);
  }
  if (config.provider === "vllm-local") {
    const apiKey = config.openai?.apiKey || "";
    const model = config.openai?.model || "vllm-local";
    const baseURL = config.openai?.baseURL || "http://localhost:8000/v1";
    return new OpenAiBridge(apiKey, model, baseURL);
  }
  if (config.provider === "ollama-local") {
    const apiKey = config.openai?.apiKey || "";
    const model = config.openai?.model || "llama3";
    const baseURL = config.openai?.baseURL || "http://localhost:11434/v1";
    return new OpenAiBridge(apiKey, model, baseURL);
  }
  throw new Error(`Unsupported provider: ${config.provider}`);
}

export function resolveLanguageAgent(config: CleanClawConfig): LanguageAgent {
  const custom = config.customAgents?.find(a => a.stack === config.stack);
  if (custom) {
    return new GenericAgent(custom.stack, custom.systemPrompt);
  }

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
