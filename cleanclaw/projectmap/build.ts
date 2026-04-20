import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";
import { classifyFile } from "./classifier.js";
import { getProvider } from "./embedder.js";
import { extractMethods, embedTextForMethod, embedTextForMisc, isCodeFile } from "./extractor.js";
import { saveTable } from "./store.js";
import type { MethodRow, MiscRow } from "./store.js";
import type { CleanClawConfig } from "../config/config-schema.js";

const LAYERS = ["backend", "frontend", "mediator"] as const;
type Layer = (typeof LAYERS)[number];
const MISC_LAYER = "misc";

const SKIP_DIRS = new Set([".git", "node_modules", "__pycache__", ".cleanclaw", "dist", "build", ".venv", "venv"]);
const MISC_EXTENSIONS = new Set([".json", ".md", ".yaml", ".yml", ".html", ".xml", ".env", ".toml", ".ini", ".cfg"]);

function* iterFiles(root: string): Generator<string> {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        yield* iterFiles(join(root, entry.name));
      }
    } else {
      yield join(root, entry.name);
    }
  }
}

export async function build(projectRoot: string, config: CleanClawConfig): Promise<void> {
  const storeDir = join(projectRoot, ".cleanclaw", "projectmap");
  const layerMap = config.layerMap ?? null;
  const extraKeywords = config.layerKeywords ?? null;
  const provider = await getProvider(config);

  const layerRows: Record<Layer, MethodRow[]> = { backend: [], frontend: [], mediator: [] };
  const layerTexts: Record<Layer, string[]> = { backend: [], frontend: [], mediator: [] };
  const miscRows: MiscRow[] = [];
  const miscTexts: string[] = [];

  console.log(`[ProjectMap] Scanning ${projectRoot} ...`);

  for (const filePath of iterFiles(projectRoot)) {
    const rel = relative(projectRoot, filePath);
    const layer = classifyFile(rel, layerMap, extraKeywords);
    const ext = extname(filePath).toLowerCase();

    if (isCodeFile(filePath)) {
      let content: string;
      try {
        content = readFileSync(filePath, "utf-8");
      } catch {
        continue;
      }
      const methods = extractMethods(rel, content);
      if (methods.length > 0 && (LAYERS as readonly string[]).includes(layer)) {
        for (const row of methods) {
          layerRows[layer as Layer].push(row);
          layerTexts[layer as Layer].push(embedTextForMethod(row));
        }
      } else if ((methods.length === 0 && MISC_EXTENSIONS.has(ext)) || layer === MISC_LAYER) {
        const row: MiscRow = { filename: basename(filePath), full_path: rel, purpose: "", related_layer: layer };
        miscRows.push(row);
        miscTexts.push(embedTextForMisc(row));
      }
    } else if (MISC_EXTENSIONS.has(ext)) {
      const row: MiscRow = { filename: basename(filePath), full_path: rel, purpose: "", related_layer: layer };
      miscRows.push(row);
      miscTexts.push(embedTextForMisc(row));
    }
  }

  for (const layer of LAYERS) {
    if (layerTexts[layer].length === 0) continue;
    console.log(`[ProjectMap] Embedding ${layerTexts[layer].length} ${layer} methods ...`);
    const vectors = await provider.embed(layerTexts[layer]);
    saveTable(storeDir, layer, layerRows[layer], vectors);
  }

  if (miscTexts.length > 0) {
    console.log(`[ProjectMap] Embedding ${miscTexts.length} misc files ...`);
    const vectors = await provider.embed(miscTexts);
    saveTable(storeDir, MISC_LAYER, miscRows, vectors);
  }

  console.log("[ProjectMap] Build complete.");
}
