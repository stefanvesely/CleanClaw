import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  collectProjectMapManifestFiles,
  inspectProjectMapFreshness,
  loadProjectMapManifest,
  projectMapManifestPath,
  writeProjectMapManifest,
} from "./manifest.js";

describe("ProjectMap manifest", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cleanclaw-projectmap-manifest-"));
    fs.mkdirSync(path.join(tmpDir, "src"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "src", "app.ts"), "export const app = true;\n", "utf-8");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("writes and loads a project-local manifest", () => {
    const manifest = writeProjectMapManifest(tmpDir, new Date("2026-05-24T17:05:00.000Z"));
    const loaded = loadProjectMapManifest(tmpDir);

    expect(fs.existsSync(projectMapManifestPath(tmpDir))).toBe(true);
    expect(loaded?.createdAt).toBe(manifest.createdAt);
    expect(loaded?.files.map(file => file.path)).toEqual(["src/app.ts"]);
    expect(loaded?.storagePolicy.warningThresholdBytes).toBe(50 * 1024 * 1024);
  });

  it("reports fresh when files match the manifest", () => {
    writeProjectMapManifest(tmpDir, new Date(), {
      embeddings: { provider: "local", model: "Xenova/all-MiniLM-L6-v2" },
    } as never);

    expect(inspectProjectMapFreshness(tmpDir, {
      embeddings: { provider: "local", model: "Xenova/all-MiniLM-L6-v2" },
    } as never)).toMatchObject({
      status: "fresh",
      changed: [],
      added: [],
      deleted: [],
      embeddingChanged: false,
    });
  });

  it("reports stale when embedding provider or model changed", () => {
    writeProjectMapManifest(tmpDir, new Date(), {
      embeddings: { provider: "local", model: "old-model" },
    } as never);

    const freshness = inspectProjectMapFreshness(tmpDir, {
      embeddings: { provider: "local", model: "new-model" },
    } as never);

    expect(freshness.status).toBe("stale");
    expect(freshness.embeddingChanged).toBe(true);
    expect(freshness.previousEmbedding).toEqual({ provider: "local", model: "old-model" });
    expect(freshness.currentEmbedding).toEqual({ provider: "local", model: "new-model" });
  });

  it("reports changed, added, and deleted files", () => {
    fs.writeFileSync(path.join(tmpDir, "src", "old.ts"), "export const old = true;\n", "utf-8");
    writeProjectMapManifest(tmpDir);

    fs.writeFileSync(path.join(tmpDir, "src", "app.ts"), "export const app = false;\n", "utf-8");
    fs.writeFileSync(path.join(tmpDir, "src", "new.ts"), "export const next = true;\n", "utf-8");
    fs.unlinkSync(path.join(tmpDir, "src", "old.ts"));

    const freshness = inspectProjectMapFreshness(tmpDir);

    expect(freshness.status).toBe("stale");
    expect(freshness.changed).toEqual(["src/app.ts"]);
    expect(freshness.added).toEqual(["src/new.ts"]);
    expect(freshness.deleted).toEqual(["src/old.ts"]);
  });

  it("ignores generated and dependency directories", () => {
    fs.mkdirSync(path.join(tmpDir, ".cleanclaw", "projectmap"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, "node_modules", "pkg"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".cleanclaw", "projectmap", "backend.json"), "[]", "utf-8");
    fs.writeFileSync(path.join(tmpDir, "node_modules", "pkg", "index.js"), "", "utf-8");

    const files = collectProjectMapManifestFiles(tmpDir);

    expect(files.map(file => file.path)).toEqual(["src/app.ts"]);
  });
});
