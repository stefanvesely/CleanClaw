import type { NumberedPromptConfig } from "../core/numbered-prompt.js";
import {
  loadProjectMapManifest,
  PROJECTMAP_SIZE_WARNING_BYTES,
  projectMapDirectorySizeBytes,
  saveProjectMapManifest,
  writeProjectMapManifest,
  type ProjectMapManifest,
  type ProjectMapStoragePolicy,
} from "./manifest.js";

export type ProjectMapStorageChoice = NonNullable<ProjectMapStoragePolicy["choice"]>;

export interface ProjectMapStorageInspection {
  sizeBytes: number;
  thresholdBytes: number;
  status: "within-threshold" | "over-threshold";
  choice?: ProjectMapStorageChoice;
}

export function inspectProjectMapStorage(projectRoot: string): ProjectMapStorageInspection {
  const manifest = loadProjectMapManifest(projectRoot);
  const sizeBytes = projectMapDirectorySizeBytes(projectRoot);
  const thresholdBytes = manifest?.storagePolicy.warningThresholdBytes ?? PROJECTMAP_SIZE_WARNING_BYTES;
  return {
    sizeBytes,
    thresholdBytes,
    status: sizeBytes > thresholdBytes ? "over-threshold" : "within-threshold",
    choice: manifest?.storagePolicy.choice,
  };
}

export function formatProjectMapStorageSummary(inspection: ProjectMapStorageInspection): string {
  const size = formatBytes(inspection.sizeBytes);
  const threshold = formatBytes(inspection.thresholdBytes);
  if (inspection.status === "within-threshold") {
    return `ProjectMap storage: ${size}, within the ${threshold} warning threshold.`;
  }

  return `ProjectMap storage: ${size}, above the ${threshold} warning threshold. CleanClaw needs a storage policy choice.`;
}

export function createProjectMapStoragePolicyPrompt(
  inspection: ProjectMapStorageInspection,
): NumberedPromptConfig | null {
  if (inspection.status !== "over-threshold") return null;

  return {
    question: "ProjectMap is above the storage warning threshold. What should CleanClaw do?",
    defaultId: inspection.choice ?? "local",
    options: [
      {
        id: "commit",
        label: "Commit anyway",
        description: "Treat ProjectMap as valid project memory even though it is larger than the warning threshold.",
      },
      {
        id: "local",
        label: "Keep local",
        description: "Record that ProjectMap should stay local or ignored unless explicitly approved later.",
        recommended: !inspection.choice || inspection.choice === "local",
      },
      {
        id: "compact",
        label: "Compact or rebuild",
        description: "Plan a compaction/rebuild pass before deciding whether to commit ProjectMap.",
      },
      {
        id: "exclude",
        label: "Exclude folders",
        description: "Plan folder exclusions before rebuilding ProjectMap.",
      },
    ],
  };
}

export function saveProjectMapStorageChoice(
  projectRoot: string,
  choice: ProjectMapStorageChoice,
  now = new Date(),
): ProjectMapManifest {
  const manifest = loadProjectMapManifest(projectRoot) ?? writeProjectMapManifest(projectRoot, now);
  const updated: ProjectMapManifest = {
    ...manifest,
    updatedAt: now.toISOString(),
    lastSizeBytes: projectMapDirectorySizeBytes(projectRoot),
    storagePolicy: {
      ...manifest.storagePolicy,
      warningThresholdBytes: manifest.storagePolicy.warningThresholdBytes ?? PROJECTMAP_SIZE_WARNING_BYTES,
      choice,
    },
  };
  saveProjectMapManifest(updated);
  return updated;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const mib = bytes / (1024 * 1024);
  if (mib >= 1) return `${mib.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
