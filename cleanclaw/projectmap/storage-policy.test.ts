import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createProjectMapStoragePolicyPrompt,
  formatProjectMapStorageSummary,
  inspectProjectMapStorage,
  saveProjectMapStorageChoice,
} from "./storage-policy.js";
import { loadProjectMapManifest, saveProjectMapManifest, writeProjectMapManifest } from "./manifest.js";

describe("ProjectMap storage policy", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cleanclaw-projectmap-storage-"));
    fs.mkdirSync(path.join(tmpDir, ".cleanclaw", "projectmap"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "src.ts"), "export const ok = true;\n", "utf-8");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("reports within-threshold storage without prompting", () => {
    writeProjectMapManifest(tmpDir);

    const inspection = inspectProjectMapStorage(tmpDir);

    expect(inspection.status).toBe("within-threshold");
    expect(createProjectMapStoragePolicyPrompt(inspection)).toBeNull();
    expect(formatProjectMapStorageSummary(inspection)).toContain("within");
  });

  it("offers numbered policy choices when over threshold", () => {
    const manifest = writeProjectMapManifest(tmpDir);
    manifest.storagePolicy.warningThresholdBytes = 1;
    saveProjectMapManifest(manifest);
    fs.writeFileSync(path.join(tmpDir, ".cleanclaw", "projectmap", "backend.vectors.json"), "[[1,2,3]]", "utf-8");
    saveProjectMapStorageChoice(tmpDir, "local");

    const inspection = inspectProjectMapStorage(tmpDir);
    const prompt = createProjectMapStoragePolicyPrompt(inspection);

    expect(inspection.status).toBe("over-threshold");
    expect(prompt?.defaultId).toBe("local");
    expect(prompt?.options.map(option => option.id)).toEqual(["commit", "local", "compact", "exclude"]);
    expect(formatProjectMapStorageSummary(inspection)).toContain("above");
  });

  it("stores selected policy and last observed size in the manifest", () => {
    writeProjectMapManifest(tmpDir);
    fs.writeFileSync(path.join(tmpDir, ".cleanclaw", "projectmap", "misc.vectors.json"), "[[1]]", "utf-8");

    const updated = saveProjectMapStorageChoice(tmpDir, "exclude", new Date("2026-05-24T17:45:00.000Z"));
    const loaded = loadProjectMapManifest(tmpDir);

    expect(updated.storagePolicy.choice).toBe("exclude");
    expect(loaded?.storagePolicy.choice).toBe("exclude");
    expect(loaded?.lastSizeBytes).toBeGreaterThan(0);
  });
});
