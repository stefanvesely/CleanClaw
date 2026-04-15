import json
import os
from pathlib import Path

import faiss
import numpy as np


def _index_path(store_dir: str, layer: str) -> str:
    return str(Path(store_dir) / f"{layer}.index")


def _meta_path(store_dir: str, layer: str) -> str:
    return str(Path(store_dir) / f"{layer}.json")


def load_table(store_dir: str, layer: str) -> tuple[faiss.Index | None, list[dict]]:
    """Load FAISS index and metadata sidecar for a layer. Returns (index, rows)."""
    ip = _index_path(store_dir, layer)
    mp = _meta_path(store_dir, layer)
    if not os.path.exists(ip) or not os.path.exists(mp):
        return None, []
    index = faiss.read_index(ip)
    with open(mp, encoding="utf-8") as f:
        rows = json.load(f)
    return index, rows


def save_table(store_dir: str, layer: str, rows: list[dict], vectors: list[list[float]]) -> None:
    """Build a flat FAISS index from vectors and save with metadata sidecar."""
    os.makedirs(store_dir, exist_ok=True)
    if not vectors:
        return
    arr = np.array(vectors, dtype="float32")
    faiss.normalize_L2(arr)
    index = faiss.IndexFlatIP(arr.shape[1])
    index.add(arr)
    faiss.write_index(index, _index_path(store_dir, layer))
    with open(_meta_path(store_dir, layer), "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2)


def remove_file_rows(store_dir: str, layer: str, full_path: str) -> tuple[list[dict], list[int]]:
    """Return rows and original positions with full_path removed."""
    _, all_rows = load_table(store_dir, layer)
    kept_rows = [r for r in all_rows if r.get("full_path") != full_path]
    kept_positions = [i for i, r in enumerate(all_rows) if r.get("full_path") != full_path]
    return kept_rows, kept_positions


def query_table(store_dir: str, layer: str, query_vector: list[float], top_k: int = 10) -> list[dict]:
    """Return top-k metadata rows most similar to query_vector."""
    index, rows = load_table(store_dir, layer)
    if index is None or not rows:
        return []
    arr = np.array([query_vector], dtype="float32")
    faiss.normalize_L2(arr)
    distances, indices = index.search(arr, min(top_k, len(rows)))
    return [rows[i] for i in indices[0] if i < len(rows)]
