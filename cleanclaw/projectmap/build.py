#!/usr/bin/env python3
"""Full initial scan — walks project root and builds all 4 FAISS tables."""
import argparse
import json
import os
import sys
from pathlib import Path

from classifier import classify_file
from embedding import get_provider
from extractor import extract_methods, embed_text_for_method, embed_text_for_misc, is_code_file
from store import save_table

LAYERS = ("backend", "frontend", "mediator")
MISC_LAYER = "misc"

_SKIP_DIRS = {".git", "node_modules", "__pycache__", ".cleanclaw", "dist", "build", ".venv", "venv"}
_MISC_EXTENSIONS = {".json", ".md", ".yaml", ".yml", ".html", ".xml", ".env", ".toml", ".ini", ".cfg"}


def _iter_files(root: str):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in _SKIP_DIRS]
        for fname in filenames:
            yield os.path.join(dirpath, fname)


def build(project_root: str, config: dict) -> None:
    store_dir = str(Path(project_root) / ".cleanclaw" / "projectmap")
    layer_map = config.get("layerMap")
    extra_keywords = config.get("layerKeywords")
    provider = get_provider(config)

    layer_rows: dict[str, list[dict]] = {l: [] for l in LAYERS}
    layer_texts: dict[str, list[str]] = {l: [] for l in LAYERS}
    misc_rows: list[dict] = []
    misc_texts: list[str] = []

    print(f"[ProjectMap] Scanning {project_root} ...")

    for file_path in _iter_files(project_root):
        rel = os.path.relpath(file_path, project_root)
        layer = classify_file(rel, layer_map, extra_keywords)
        ext = Path(file_path).suffix.lower()

        if is_code_file(file_path):
            try:
                content = Path(file_path).read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            methods = extract_methods(rel, content)
            if methods and layer in LAYERS:
                for row in methods:
                    layer_rows[layer].append(row)
                    layer_texts[layer].append(embed_text_for_method(row))
            elif not methods and ext in _MISC_EXTENSIONS or layer == MISC_LAYER:
                row = {"filename": Path(file_path).name, "purpose": "", "related_layer": layer}
                misc_rows.append(row)
                misc_texts.append(embed_text_for_misc(row))
        elif ext in _MISC_EXTENSIONS:
            row = {"filename": Path(file_path).name, "purpose": "", "related_layer": layer}
            misc_rows.append(row)
            misc_texts.append(embed_text_for_misc(row))

    for layer in LAYERS:
        if not layer_texts[layer]:
            continue
        print(f"[ProjectMap] Embedding {len(layer_texts[layer])} {layer} methods ...")
        vectors = provider.embed(layer_texts[layer])
        save_table(store_dir, layer, layer_rows[layer], vectors)

    if misc_texts:
        print(f"[ProjectMap] Embedding {len(misc_texts)} misc files ...")
        vectors = provider.embed(misc_texts)
        save_table(store_dir, MISC_LAYER, misc_rows, vectors)

    print("[ProjectMap] Build complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build ProjectMap index for a project.")
    parser.add_argument("--root", required=True, help="Project root directory")
    parser.add_argument("--config", default="cleanclaw.config.json", help="Path to cleanclaw.config.json")
    args = parser.parse_args()

    config_path = args.config if os.path.isabs(args.config) else os.path.join(args.root, args.config)
    if not os.path.exists(config_path):
        print(f"[ProjectMap] Config not found: {config_path}", file=sys.stderr)
        sys.exit(1)

    with open(config_path, encoding="utf-8") as f:
        config = json.load(f)

    build(args.root, config)
