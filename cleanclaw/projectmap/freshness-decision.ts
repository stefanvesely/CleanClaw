import type { NumberedPromptConfig } from "../core/numbered-prompt.js";
import type { ProjectMapFreshness } from "./manifest.js";

export type ProjectMapFreshnessAction = "reuse" | "build" | "update-changed" | "rebuild" | "continue-stale" | "skip";

export function decideProjectMapFreshnessAction(freshness: ProjectMapFreshness): ProjectMapFreshnessAction {
  if (freshness.status === "fresh") return "reuse";
  if (freshness.status === "missing") return "build";
  return "update-changed";
}

export function formatProjectMapFreshnessSummary(freshness: ProjectMapFreshness): string {
  if (freshness.status === "missing") {
    return "ProjectMap: missing. CleanClaw needs approval before building project memory.";
  }

  if (freshness.status === "fresh") {
    return `ProjectMap: fresh. Reusing existing project memory (${freshness.unchanged.length} tracked file${freshness.unchanged.length === 1 ? "" : "s"} match).`;
  }

  const lines = [
    "ProjectMap: stale. CleanClaw needs approval before rebuilding project memory.",
    `Changed: ${freshness.changed.length}`,
    `Added: ${freshness.added.length}`,
    `Deleted: ${freshness.deleted.length}`,
  ];
  if (freshness.embeddingChanged && freshness.previousEmbedding && freshness.currentEmbedding) {
    lines.push(`Embedding changed: ${freshness.previousEmbedding.provider}/${freshness.previousEmbedding.model} -> ${freshness.currentEmbedding.provider}/${freshness.currentEmbedding.model}`);
  }
  const examples = [...freshness.changed, ...freshness.added, ...freshness.deleted].slice(0, 5);
  if (examples.length > 0) {
    lines.push("Examples:");
    lines.push(...examples.map(file => `- ${file}`));
  }
  return lines.join("\n");
}

export function createProjectMapFreshnessPrompt(freshness: ProjectMapFreshness): NumberedPromptConfig | null {
  if (freshness.status === "fresh") return null;

  if (freshness.status === "missing") {
    return {
      question: "ProjectMap is missing. What should CleanClaw do?",
      defaultId: "build",
      options: [
        {
          id: "build",
          label: "Build ProjectMap",
          description: "Create project-local memory in .cleanclaw/projectmap before planning work.",
          recommended: true,
        },
        {
          id: "skip",
          label: "Skip for now",
          description: "Continue setup without building project memory.",
        },
      ],
    };
  }

  return {
    question: "ProjectMap is stale. What should CleanClaw do?",
    defaultId: freshness.embeddingChanged ? "rebuild" : "update-changed",
    options: [
      {
        id: "update-changed",
        label: "Update changed files only",
        description: freshness.embeddingChanged
          ? "Available only if you intentionally keep the existing embedding model for unchanged vectors."
          : "Refresh only changed, added, and deleted files listed by the manifest.",
        recommended: !freshness.embeddingChanged,
      },
      {
        id: "rebuild",
        label: "Rebuild full ProjectMap",
        description: freshness.embeddingChanged
          ? "Required to rebuild all vectors with the current embedding provider/model."
          : "Refresh project memory from the current project files.",
        recommended: freshness.embeddingChanged,
      },
      {
        id: "continue-stale",
        label: "Continue with stale ProjectMap",
        description: "Use existing memory for now and record that it may be out of date.",
      },
      {
        id: "skip",
        label: "Skip for this setup",
        description: "Do not use ProjectMap during this setup run.",
      },
    ],
  };
}
