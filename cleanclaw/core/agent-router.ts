import type { CleanClawConfig } from "../config/config-schema.js";
import type { Bridge } from "../bridges/anthropic-bridge.js";
import { AnthropicBridge } from "../bridges/anthropic-bridge.js";
import { OpenAiBridge } from "../bridges/openai-bridge.js";

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

export function resolveLanguageAgent(config: CleanClawConfig): null {
    // stub — wired in Weekend 3
  }

