// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getConfig } from "../core/config-loader.js";
import { PROVIDER_CREDENTIAL_ENV, resolveConfigCredential } from "../core/credential-resolver.js";
import { runPipeline } from "../core/pipeline.js";
import type { CleanClawConfig } from "../config/config-schema.js";

export interface ModeRuntime {
  run(input?: string): Promise<void>;
}

export class CleanClawMode implements ModeRuntime {
  async run(input?: string): Promise<void> {
    const taskDescription = input ?? "";
    const config: CleanClawConfig = getConfig();

    const { config: resolvedConfig, credentialEnv, credentialValue } = resolveConfigCredential(config);
    if (!credentialValue) {
      throw new Error(
        `Missing credential for provider "${config.provider}". ` +
          `Set ${credentialEnv} or run: nemoclaw credentials reset <PROVIDER>, then re-run onboard. ` +
          `Known providers: ${Object.keys(PROVIDER_CREDENTIAL_ENV).join(", ")}`,
      );
    }

    await runPipeline(taskDescription, resolvedConfig);
  }
}
