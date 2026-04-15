#!/usr/bin/env python3
"""Incremental update — re-indexes a single changed file."""
import argparse
import json
import os
import sys
from pathlib import Path

from classifier import classify_file
from embedding import get_provider
from extractor import extract_methods, embed_text_for_method, embed_text_for_misc, is_code_file
from store import load_table, remove_file_rows, save_table

LAYERS = ("backend", "frontend", "mediator")
MISC_LAYER = "misc"


def update(project_root: str, file_path: str, config: dict) -> None:
    rel = os.path.relpath(file_path, project_root)
    store_dir = str(Path(project_root) / ".cleanclaw" / "projectmap")
    layer_map = config.get("layerMap")
    extra_keywords = config.get("layerKeywords")
    layer = classify_file(rel, layer_map, extra_keywords)
    provider = get_provider(config)

    # Remove stale rows for this file from whichever table it belongs to
    for l in (*LAYERS, MISC_LAYER):
        kept_rows, kept_positions = remove_file_rows(store_dir, l, rel)
        if len(kept_rows) < len(load_table(store_dir, l)[1]):
            # File had rows in this table — rebuild it without those rows
            if kept_rows:
                _, old_rows = load_table(store_dir, l)
                old_texts = [
                    embed_text_for_method(r) if l in LAYERS else embed_text_for_misc(r)
                    for i, r in enumerate(old_rows) if i in set(kept_positions)
                ]
                vectors = provider.embed(old_texts)
                save_table(store_dir, l, kept_rows, vectors)

    # Skip deleted files
    if not os.path.exists(file_path):
        print(f"[ProjectMap] {rel} deleted — rows removed.")
        return

    # Re-index the file
    if is_code_file(file_path) and layer in LAYERS:
        try:
            content = Path(file_path).read_text(encoding="utf-8", errors="ignore")
        except OSError:
            return
        new_rows = extract_methods(rel, content)
        if not new_rows:
            return
        _, existing_rows = load_table(store_dir, layer)
        all_rows = existing_rows + new_rows
        all_texts = [embed_text_for_method(r) for r in all_rows]
        vectors = provider.embed(all_texts)
        save_table(store_dir, layer, all_rows, vectors)
        print(f"[ProjectMap] Updated {len(new_rows)} methods from {rel} in {layer}.")
    else:
        row = {"filename": Path(file_path).name, "purpose": "", "related_layer": layer}
        _, existing_rows = load_table(store_dir, MISC_LAYER)
        all_rows = existing_rows + [row]
        all_texts = [embed_text_for_misc(r) for r in all_rows]
        vectors = provider.embed(all_texts)
        save_table(store_dir, MISC_LAYER, all_rows, vectors)
        print(f"[ProjectMap] Updated misc entry for {rel}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Incrementally update ProjectMap for one file.")
    parser.add_argument("--root", required=True, help="Project root directory")
    parser.add_argument("--file", required=True, help="Absolute path of the changed file")
    parser.add_argument("--config", default="cleanclaw.config.json", help="Path to cleanclaw.config.json")
    args = parser.parse_args()

    config_path = args.config if os.path.isabs(args.config) else os.path.join(args.root, args.config)
    if not os.path.exists(config_path):
        print(f"[ProjectMap] Config not found: {config_path}", file=sys.stderr)
        sys.exit(1)

    with open(config_path, encoding="utf-8") as f:
        config = json.load(f)

    update(args.root, args.file, config)
