// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* v8 ignore start -- oclif runtime bridge covered through CLI integration tests. */

import { Config as OclifConfig } from "@oclif/core";

import { CLI_NAME } from "./branding";
import registeredCommands from "./oclif-commands";

type LocalOclifCommand = {
  run(argv: string[], root?: string): Promise<unknown>;
  description?: string;
  examples?: string[];
  flags?: Record<string, unknown>;
  summary?: string;
  usage?: string | string[];
};

export interface OclifCommandRunOptions {
  rootDir: string;
  error?: (message?: string) => void;
  exit?: (code: number) => never;
}

function getOclifExitCode(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const oclif = (error as { oclif?: { exit?: number } }).oclif;
  return typeof oclif?.exit === "number" ? oclif.exit : null;
}

function isOclifParseError(error: unknown): boolean {
  const name =
    error && typeof error === "object"
      ? (error as { constructor?: { name?: string } }).constructor?.name
      : "";
  return name === "NonExistentFlagsError" || name === "UnexpectedArgsError" || name === "CLIError";
}

function formatOclifError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.trim();
  }

  return String(error).trim();
}

function applyBrandedBin(config: OclifConfig): void {
  const pjson = {
    ...config.pjson,
    oclif: {
      ...config.pjson.oclif,
      bin: CLI_NAME,
    },
  };
  // config.runCommand() calls Command.run(), which reloads from the root
  // plugin. Patch both config and root plugin metadata so alias launchers keep
  // branded oclif help output.
  config.bin = CLI_NAME;
  config.pjson = pjson;
  config.options.pjson = pjson;
  for (const plugin of config.plugins.values()) {
    if (plugin.root === config.root) {
      plugin.pjson = pjson;
      plugin.options.pjson = pjson;
    }
  }
}

function hasHelpFlag(args: string[]): boolean {
  return args.includes("--help") || args.includes("-h");
}

function replaceBinTemplate(value: string): string {
  return value.replaceAll("<%= config.bin %>", CLI_NAME);
}

function toLines(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function renderLocalCommandHelp(commandId: string, command: LocalOclifCommand): void {
  const usages = toLines(command.usage);
  const primaryUsage = usages[0] ?? commandId.replaceAll(":", " ");
  const descriptions = [command.summary, command.description].filter(
    (line): line is string => typeof line === "string" && line.length > 0,
  );
  const flags = Object.keys(command.flags ?? {}).filter((flag) => flag !== "help");
  const examples = toLines(command.examples);

  console.log(`Usage: ${CLI_NAME} ${replaceBinTemplate(primaryUsage)}`);

  if (descriptions.length > 0) {
    console.log("");
    console.log(descriptions.join("\n"));
  }

  if (flags.length > 0) {
    console.log("");
    console.log("Flags:");
    for (const flag of flags) {
      console.log(`  --${flag}`);
    }
  }

  if (examples.length > 0) {
    console.log("");
    console.log("Examples:");
    for (const example of examples) {
      console.log(`  ${replaceBinTemplate(example)}`);
    }
  }
}

export async function runRegisteredOclifCommand(
  commandId: string,
  args: string[],
  opts: OclifCommandRunOptions,
): Promise<void> {
  const config = await OclifConfig.load(opts.rootDir);
  applyBrandedBin(config);
  const errorLine = opts.error ?? console.error;
  const exit = opts.exit ?? ((code: number) => process.exit(code));
  const command = (registeredCommands as Record<string, LocalOclifCommand | undefined>)[commandId];

  try {
    if (command) {
      if (hasHelpFlag(args) && command.flags) {
        renderLocalCommandHelp(commandId, command);
        process.exitCode = 0;
        return;
      }
      await command.run(args, opts.rootDir);
    } else {
      await config.runCommand(commandId, args);
    }
  } catch (error) {
    const exitCode = getOclifExitCode(error);
    if (exitCode === 0) {
      process.exitCode = 0;
      return;
    }

    if (isOclifParseError(error)) {
      errorLine(`  ${formatOclifError(error)}`);
      exit(exitCode ?? 1);
    }

    throw error;
  }
}
