import fs from "fs";
import path from "path";
import type { CleanClawConfig } from '../config/config-schema.js';
import defaultConfig from "../config/default-config.json";
let userConfig: unknown = {};

const configPath = path.join(process.cwd(), "cleanclaw.config.json");
try {
  const fileContents = fs.readFileSync(configPath, "utf-8");
  userConfig = JSON.parse(fileContents);
} catch {
  userConfig = {};
}

const mergedConfig = deepMerge(defaultConfig, userConfig) as CleanClawConfig;

const apiKey = resolveApiKey(mergedConfig);
if (!apiKey) {
  if (mergedConfig.provider === "openai") {
    throw new Error(
      "Missing OpenAI API key. Set OPENAI_API_KEY or provide it in config."
    );
  }

  if (mergedConfig.provider === "anthropic") {
    throw new Error(
      "Missing Anthropic API key. Set ANTHROPIC_API_KEY or provide it in config."
    );
  }
}


function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    const bothObjects =
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue);

    if (bothObjects) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}

function resolveApiKey(config: any): string {
  if (config.provider === "openai") {
    return config.openai?.apiKey || process.env.OPENAI_API_KEY || "";
  }
  if (config.provider === "anthropic") {
    return config.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY || "";
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}



export function getConfig(): CleanClawConfig {
  return mergedConfig;
}
