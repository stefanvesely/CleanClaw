// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { execSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import path from "node:path";

export interface ResolveOpenshellOptions {
  /** Mock result for shell path lookup (undefined = run real command). */
  commandVResult?: string | null;
  /** Override executable check (default: fs.accessSync X_OK). */
  checkExecutable?: (path: string) => boolean;
  /** HOME directory override. */
  home?: string;
}

function firstAbsolutePath(value: string | null | undefined): string | null {
  const lines = String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.find((line) => isAbsolutePath(line)) ?? null;
}

function isAbsolutePath(value: string): boolean {
  return path.isAbsolute(value) || value.startsWith("/");
}

function joinHomeCandidate(home: string, ...parts: string[]): string {
  return home.startsWith("/") ? [home, ...parts].join("/") : path.join(home, ...parts);
}

/**
 * Resolve the openshell binary path.
 *
 * Checks `command -v` first (must return an absolute path to prevent alias
 * injection), then falls back to common installation directories.
 */
export function resolveOpenshell(opts: ResolveOpenshellOptions = {}): string | null {
  const home = opts.home ?? process.env.HOME;
  const checkExecutable =
    opts.checkExecutable ??
    ((p: string): boolean => {
      try {
        accessSync(p, constants.X_OK);
        return true;
      } catch {
        return false;
      }
    });

  const override = process.env.NEMOCLAW_OPENSHELL_BIN;
  if (override && isAbsolutePath(override) && checkExecutable(override)) {
    return override;
  }

  // Step 1: shell path lookup
  if (opts.commandVResult === undefined) {
    try {
      const lookupCommand = process.platform === "win32" ? "where.exe openshell" : "command -v openshell";
      const found = firstAbsolutePath(execSync(lookupCommand, { encoding: "utf-8" }));
      if (found) return found;
    } catch {
      /* ignored */
    }
  } else {
    const found = firstAbsolutePath(opts.commandVResult);
    if (found) return found;
  }

  // Step 2: fallback candidates
  const candidates = [
    ...(home && isAbsolutePath(home)
      ? [
          joinHomeCandidate(home, ".local", "bin", "openshell"),
          joinHomeCandidate(home, "bin", "openshell"),
          joinHomeCandidate(home, "bin", "openshell.cmd"),
          joinHomeCandidate(home, "bin", "openshell.exe"),
        ]
      : []),
    "/usr/local/bin/openshell",
    "/usr/bin/openshell",
  ];
  for (const p of candidates) {
    if (checkExecutable(p)) return p;
  }

  return null;
}
