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

import { getConfig } from "../../cleanclaw/core/config-loader.js";
import { getCredential } from "../lib/credentials.js";
import { getProviderSelectionConfig } from "../lib/inference-config.js";
import { runPipeline } from "../../cleanclaw/core/pipeline.js";
import type { CleanClawConfig } from "../../cleanclaw/config/config-schema.js";
import type { ProviderSelectionConfig } from "../lib/inference-config.js";

export interface ModeRuntime {
  run(taskDescription: string): Promise<void>;
}

export class CleanClawMode implements ModeRuntime {
  async run(taskDescription: string): Promise<void> {
    const config: CleanClawConfig = getConfig();

    // Credential guard
    const credentialEnv = config.provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY";
    const apiKey = getCredential(credentialEnv);
    if (!apiKey) {
      throw new Error(
        `Missing credential for provider "${config.provider}". ` +
          `Set ${credentialEnv} or run: nemoclaw credential set ${credentialEnv}`,
      );
    }

    // Inference guard
    // DEGRADED MODE: unknown provider → null → abort
    const inferenceConfig: ProviderSelectionConfig | null = getProviderSelectionConfig(
      config.provider,
      config.provider === "anthropic" ? config.anthropic?.model : config.openai?.model,
    );
    if (!inferenceConfig) {
      throw new Error(
        `Unknown provider "${config.provider}". ` +
          `Check the "provider" field in cleanclaw.config.json.`,
      );
    }

    // Config guard — inject NemoClaw-stored key into config for anthropic if not already set
    let resolvedConfig: CleanClawConfig = config;
    if (config.provider === "anthropic" && !config.anthropic?.apiKey) {
      resolvedConfig = {
        ...config,
        anthropic: {
          ...(config.anthropic ?? { model: inferenceConfig.model }),
          apiKey,
        },
      };
    }

    await runPipeline(taskDescription, resolvedConfig);
  }
}
