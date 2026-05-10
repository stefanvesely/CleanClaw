import fs from "fs";
import path from "path";
import os from "os";
import type { CleanClawConfig } from '../config/config-schema.js';
import defaultConfig from "../config/default-config.json" with { type: "json" };
import { mergeConfigs } from './config-merger.js';

let globalConfig: Partial<CleanClawConfig> = {};
const globalConfigPath = path.join(os.homedir(), ".cleanclaw", "config.json");
try {
  globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, "utf-8"));
} catch {
  globalConfig = {};
}

let projectConfig: Partial<CleanClawConfig> = {};
const configPath = path.join(process.cwd(), "cleanclaw.config.json");
try {
  projectConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} catch {
  projectConfig = {};
}

const withGlobal = mergeConfigs(defaultConfig as Partial<CleanClawConfig>, globalConfig);
const mergedConfig = mergeConfigs(withGlobal, projectConfig);

export function getConfig(): CleanClawConfig {
  return mergedConfig;
}
