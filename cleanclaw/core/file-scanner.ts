import { execSync } from "child_process";
import type { CleanClawConfig } from "../config/config-schema.js";
import { resolveBridge } from "./agent-router.js";

export async function scanRelevantFiles(
  taskDescription: string,
  repoRoot: string,
  config: CleanClawConfig,
): Promise<string[]> {
  let allFiles: string[];

  try {
    const output = execSync("git ls-files", {
      cwd: repoRoot,
      encoding: "utf-8",
    }).trim();
    allFiles = output.split("\n").filter((f) => f.length > 0);
  } catch {
    console.warn("[file-scanner] git ls-files failed — returning empty file list");
    return [];
  }

  if (allFiles.length === 0) {
    return [];
  }

  const prompt = [
    "Given this task description, which of these files are likely relevant?",
    "Return only the file paths, one per line, most relevant first. Limit to 20 files.",
    "",
    `Task description: ${taskDescription}`,
    "",
    "Files:",
    ...allFiles,
  ].join("\n");

  try {
    const bridge = resolveBridge(config);
    const response = await bridge.send([{ role: "user", content: prompt }]);
    const relevant = response.content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && allFiles.includes(line));
    return relevant;
  } catch (err) {
    console.warn("[file-scanner] LLM call failed — returning full file list:", err);
    return allFiles;
  }
}
