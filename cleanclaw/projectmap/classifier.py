from pathlib import Path

_HEURISTICS: dict[str, set[str]] = {
    "backend": {
        "backend", "api", "server", "controllers", "services", "repositories",
        "handlers", "domain", "data", "models", "entities", "infrastructure",
        "persistence", "database", "db", "dal", "bll", "business", "core",
        "workers", "jobs", "tasks", "queues", "events", "notifications",
    },
    "frontend": {
        "frontend", "client", "ui", "components", "pages", "views", "screens",
        "app", "assets", "styles", "scss", "css", "layouts", "templates",
        "widgets", "hooks", "store", "reducers", "actions", "selectors",
    },
    "mediator": {
        "mediator", "gateway", "middleware", "hubs", "proxy", "bridge",
        "adapters", "connectors", "integrations", "transforms", "mappers",
        "normalizers", "validators", "filters", "interceptors",
    },
}


def classify_file(file_path: str, layer_map: dict[str, str] | None = None,
                  extra_keywords: dict[str, list[str]] | None = None) -> str:
    """Return 'backend', 'frontend', 'mediator', or 'misc' for the given path.

    layer_map:     exact prefix overrides from config  e.g. {"src/Shared": "backend"}
    extra_keywords: additional keywords per layer from config
                    e.g. {"backend": ["myservice"], "frontend": ["portal"]}
    """
    if layer_map:
        for prefix, layer in layer_map.items():
            if file_path.startswith(prefix):
                return layer

    heuristics = _HEURISTICS
    if extra_keywords:
        heuristics = {
            layer: keywords | set(extra_keywords.get(layer, []))
            for layer, keywords in _HEURISTICS.items()
        }

    parts = {p.lower() for p in Path(file_path).parts}
    for layer, keywords in heuristics.items():
        if parts & keywords:
            return layer

    return "misc"
