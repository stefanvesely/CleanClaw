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
import { providerMetadata } from "./provider-metadata.js";

export function resolveBridge(config: CleanClawConfig): Bridge {
  const metadata = providerMetadata(config.provider);
  if (!metadata) {
    throw new Error(`Unsupported provider: ${config.provider}`);
  }

  if (metadata.bridgeFamily === "anthropic") {
    const apiKey = config.anthropic?.apiKey || "";
    const model = config.anthropic?.model || metadata.defaultModel;
    return new AnthropicBridge(apiKey, model, config.anthropic?.baseURL);
  }

  if (metadata.bridgeFamily === "openai") {
    const apiKey = config.openai?.apiKey || "";
    const model = config.openai?.model || metadata.defaultModel;
    const baseURL = config.openai?.baseURL || metadata.defaultBaseURL;
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
    node: genericAgent('node', 'Node.js and JavaScript/TypeScript backend projects'),
    nextjs: genericAgent('nextjs', 'Next.js React applications'),
    vite: genericAgent('vite', 'Vite frontend applications'),
    python: genericAgent('python', 'Python applications'),
    go: genericAgent('go', 'Go applications'),
    rust: genericAgent('rust', 'Rust applications'),
    java: genericAgent('java', 'Java applications'),
  };

  const agent = agents[config.stack];
  if (!agent) {
    throw new Error(`No language agent for stack: "${config.stack}". Supported: ${Object.keys(agents).join(', ')}`);
  }
  return agent;
}

function genericAgent(stack: string, description: string): GenericAgent {
  return new GenericAgent(
    stack,
    [
      `You are CleanClaw's ${description} coding agent.`,
      'Return one JSON proposed change that stays inside the approved task scope.',
      'Prefer small, reviewable edits and preserve existing project style.',
    ].join(' '),
  );
}
