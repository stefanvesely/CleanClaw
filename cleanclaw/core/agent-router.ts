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

export const BUILT_IN_GENERIC_AGENT_DEFINITIONS: Record<string, string> = {
  typescript: 'TypeScript and JavaScript application projects',
  javascript: 'JavaScript application projects',
  'node-package-manager': 'Node package manager and dependency workflow projects',
  cli: 'CLI interaction and command-line tool projects',
  git: 'Git, changelog, and release-history workflows',
  testing: 'Testing and validation workflows',
  documentation: 'Documentation and README workflows',
  'local-llm-runtime': 'Local LLM runtime integration work',
  embeddings: 'Embedding, search, and vector-index workflows',
  security: 'Security and permissions workflows',
  'project-planning-records': 'Project planning records and audit-trail workflows',
  react: 'React applications',
  nextjs: 'Next.js React applications',
  vue: 'Vue applications',
  nuxt: 'Nuxt applications',
  node: 'Node.js and JavaScript/TypeScript backend projects',
  express: 'Node/Express backend applications',
  python: 'Python applications',
  fastapi: 'Python/FastAPI applications',
  django: 'Python/Django applications',
  java: 'Java applications',
  spring: 'Java/Spring applications',
  go: 'Go applications',
  rust: 'Rust applications',
  php: 'PHP applications',
  laravel: 'PHP/Laravel applications',
  ruby: 'Ruby applications',
  rails: 'Ruby/Rails applications',
  flutter: 'Flutter applications',
  'react-native': 'React Native mobile applications',
  docker: 'Docker and deployment workflows',
  cicd: 'CI/CD workflow projects',
  nemoclaw: 'NemoClaw guardrail integration workflows',
  release: 'Release packaging workflows',
  enterprise: 'Enterprise policy and gateway workflows',
  vite: 'Vite frontend applications',
};

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
    ...Object.fromEntries(
      Object.entries(BUILT_IN_GENERIC_AGENT_DEFINITIONS)
        .map(([stack, description]) => [stack, genericAgent(stack, description)]),
    ),
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
