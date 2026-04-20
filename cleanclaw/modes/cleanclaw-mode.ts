// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// ─── Guard Layering ───────────────────────────────────────────────────────────
//
// This module is the entry point for the "cleanclaw" blueprint profile.
// Guard responsibility:
//   1. Credential guard  — getCredential() checks env then ~/.nemoclaw/credentials.json.
//                          If the key is missing we abort before touching the pipeline.
//   2. Inference guard   — getProviderSelectionConfig() validates the provider string.
//                          null return = unknown provider → abort with clear message.
//   3. Config guard      — getConfig() returns the merged CleanClawConfig.
//                          If provider is "anthropic" and the config has no apiKey,
//                          we inject the NemoClaw-stored credential before handing off.
//   4. Pipeline          — runPipeline() owns all further guards (scope, approval, diff).
//
// DEGRADED MODE: if getProviderSelectionConfig() returns null the run() method throws.
// No silent fallback — the caller must handle the error and surface it to the user.
// ─────────────────────────────────────────────────────────────────────────────

import { getConfig } from "../core/config-loader.js";
import { runPipeline } from "../core/pipeline.js";
import type { CleanClawConfig } from "../config/config-schema.js";

// Known providers — NemoClaw sets the corresponding env var from its credential store
const PROVIDER_CREDENTIAL_ENV: Record<string, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  "vllm-local": "OPENAI_API_KEY",
  "ollama-local": "OLLAMA_API_KEY",
};

export interface ModeRuntime {
  run(input?: string): Promise<void>;
}

export class CleanClawMode implements ModeRuntime {
  async run(input?: string): Promise<void> {
    const taskDescription = input ?? "";
    const config: CleanClawConfig = getConfig();

    // Inference guard — reject unknown providers before touching the pipeline
    // DEGRADED MODE: unknown provider → abort with clear message
    const credentialEnv = PROVIDER_CREDENTIAL_ENV[config.provider];
    if (!credentialEnv) {
      throw new Error(
        `Unknown provider "${config.provider}". ` +
          `Check the "provider" field in cleanclaw.config.json. ` +
          `Known providers: ${Object.keys(PROVIDER_CREDENTIAL_ENV).join(", ")}`,
      );
    }

    // Credential guard — read from env (NemoClaw exports credentials as env vars)
    const apiKey = process.env[credentialEnv];
    if (!apiKey) {
      throw new Error(
        `Missing credential for provider "${config.provider}". ` +
          `Set ${credentialEnv} or run: nemoclaw credential set ${credentialEnv}`,
      );
    }

    // Config guard — inject env key into config if not already set
    let resolvedConfig: CleanClawConfig = config;
    if (config.provider === "anthropic" && !config.anthropic?.apiKey) {
      resolvedConfig = {
        ...config,
        anthropic: {
          ...(config.anthropic ?? { model: "claude-sonnet-4-6" }),
          apiKey,
        },
      };
    }

    await runPipeline(taskDescription, resolvedConfig);
  }
}
