import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, sep } from "node:path";

export const PROJECTMAP_MANIFEST_VERSION = 1;
export const PROJECTMAP_SIZE_WARNING_BYTES = 50 * 1024 * 1024;

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "__pycache__",
  ".cleanclaw",
  "dist",
  "build",
  ".venv",
  "venv",
]);

export interface ProjectMapManifestFile {
  path: string;
  size: number;
  mtimeMs: number;
}

export interface ProjectMapStoragePolicy {
  warningThresholdBytes: number;
  choice?: "commit" | "local" | "compact" | "exclude";
}

export interface ProjectMapManifest {
  version: typeof PROJECTMAP_MANIFEST_VERSION;
  projectRoot: string;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  files: ProjectMapManifestFile[];
  storagePolicy: ProjectMapStoragePolicy;
}

export interface ProjectMapFreshness {
  status: "missing" | "fresh" | "stale";
  manifestPath: string;
  changed: string[];
  added: string[];
  deleted: string[];
  unchanged: string[];
}

export function projectMapDir(projectRoot: string): string {
  return join(projectRoot, ".cleanclaw", "projectmap");
}

export function projectMapManifestPath(projectRoot: string): string {
  return join(projectMapDir(projectRoot), "manifest.json");
}

export function collectProjectMapManifestFiles(projectRoot: string): ProjectMapManifestFile[] {
  const files: ProjectMapManifestFile[] = [];

  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          walk(join(dir, entry.name));
        }
        continue;
      }

      const absolutePath = join(dir, entry.name);
      const stats = statSync(absolutePath);
      files.push({
        path: normalizeRelativePath(relative(projectRoot, absolutePath)),
        size: stats.size,
        mtimeMs: Math.round(stats.mtimeMs),
      });
    }
  }

  walk(projectRoot);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export function loadProjectMapManifest(projectRoot: string): ProjectMapManifest | null {
  const manifestPath = projectMapManifestPath(projectRoot);
  if (!existsSync(manifestPath)) return null;

  const parsed = JSON.parse(readFileSync(manifestPath, "utf-8")) as Partial<ProjectMapManifest>;
  if (parsed.version !== PROJECTMAP_MANIFEST_VERSION || !Array.isArray(parsed.files)) {
    return null;
  }

  return {
    version: PROJECTMAP_MANIFEST_VERSION,
    projectRoot: parsed.projectRoot ?? projectRoot,
    createdAt: parsed.createdAt ?? new Date(0).toISOString(),
    updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    fileCount: parsed.fileCount ?? parsed.files.length,
    files: parsed.files,
    storagePolicy: parsed.storagePolicy ?? {
      warningThresholdBytes: PROJECTMAP_SIZE_WARNING_BYTES,
    },
  };
}

export function writeProjectMapManifest(projectRoot: string, now = new Date()): ProjectMapManifest {
  const existing = loadProjectMapManifest(projectRoot);
  const files = collectProjectMapManifestFiles(projectRoot);
  const manifest: ProjectMapManifest = {
    version: PROJECTMAP_MANIFEST_VERSION,
    projectRoot,
    createdAt: existing?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
    fileCount: files.length,
    files,
    storagePolicy: existing?.storagePolicy ?? {
      warningThresholdBytes: PROJECTMAP_SIZE_WARNING_BYTES,
    },
  };

  mkdirSync(projectMapDir(projectRoot), { recursive: true });
  writeFileSync(projectMapManifestPath(projectRoot), `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
  return manifest;
}

export function inspectProjectMapFreshness(projectRoot: string): ProjectMapFreshness {
  const manifestPath = projectMapManifestPath(projectRoot);
  const manifest = loadProjectMapManifest(projectRoot);
  if (!manifest) {
    return {
      status: "missing",
      manifestPath,
      changed: [],
      added: [],
      deleted: [],
      unchanged: [],
    };
  }

  const current = collectProjectMapManifestFiles(projectRoot);
  const previousByPath = new Map(manifest.files.map(file => [file.path, file]));
  const currentByPath = new Map(current.map(file => [file.path, file]));
  const changed: string[] = [];
  const added: string[] = [];
  const deleted: string[] = [];
  const unchanged: string[] = [];

  for (const file of current) {
    const previous = previousByPath.get(file.path);
    if (!previous) {
      added.push(file.path);
    } else if (previous.size !== file.size || previous.mtimeMs !== file.mtimeMs) {
      changed.push(file.path);
    } else {
      unchanged.push(file.path);
    }
  }

  for (const file of manifest.files) {
    if (!currentByPath.has(file.path)) {
      deleted.push(file.path);
    }
  }

  return {
    status: changed.length === 0 && added.length === 0 && deleted.length === 0 ? "fresh" : "stale",
    manifestPath,
    changed,
    added,
    deleted,
    unchanged,
  };
}

function normalizeRelativePath(path: string): string {
  return path.split(sep).join("/");
}
