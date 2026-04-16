#!/usr/bin/env python3
"""Query a ProjectMap layer by text — prints top-k results as JSON."""
import argparse
import json
import sys

from embedding import get_provider
from store import query_table


def main() -> None:
    parser = argparse.ArgumentParser(description="Query a ProjectMap layer by text.")
    parser.add_argument("--store-dir", required=True, help="Path to .cleanclaw/projectmap/")
    parser.add_argument("--layer", required=True, choices=["backend", "frontend", "mediator", "misc"])
    parser.add_argument("--text", required=True, help="Query text to embed and search")
    parser.add_argument("--top-k", type=int, default=10)
    parser.add_argument("--config", required=True, help="Path to cleanclaw.config.json")
    args = parser.parse_args()

    with open(args.config, encoding="utf-8") as f:
        config = json.load(f)

    provider = get_provider(config)
    vectors = provider.embed([args.text])
    results = query_table(args.store_dir, args.layer, vectors[0], top_k=args.top_k)
    print(json.dumps(results))


if __name__ == "__main__":
    main()
