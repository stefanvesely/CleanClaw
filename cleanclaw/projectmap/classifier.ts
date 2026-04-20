import path from "path";

const _HEURISTICS: Record<string, Set<string>> = {
  backend: new Set([
    "backend", "api", "server", "services", "repositories",
    "handlers", "domain", "data", "models", "entities", "infrastructure",
    "persistence", "database", "db", "dal", "bll", "business", "core",
    "workers", "jobs", "tasks", "queues", "events", "notifications",
  ]),
  frontend: new Set([
    "frontend", "client", "ui", "components", "pages", "views", "screens",
    "app", "assets", "styles", "scss", "css", "layouts", "templates",
    "widgets", "hooks", "store", "reducers", "actions", "selectors",
  ]),
  mediator: new Set([
    "mediator", "gateway", "middleware", "hubs", "proxy", "bridge", "controllers",
    "adapters", "connectors", "integrations", "transforms", "mappers",
    "normalizers", "validators", "filters", "interceptors",
  ]),
};

export function classifyFile(
  filePath: string,
  layerMap?: Record<string, string> | null,
  extraKeywords?: Record<string, string[]> | null
): string {
  if (layerMap) {
    for (const [prefix, layer] of Object.entries(layerMap)) {
      if (filePath.startsWith(prefix)) {
        return layer;
      }
    }
  }

  let heuristics = _HEURISTICS;
  if (extraKeywords) {
    heuristics = {} as Record<string, Set<string>>;
    for (const [layer, keywords] of Object.entries(_HEURISTICS)) {
      const extra = extraKeywords[layer] ?? [];
      heuristics[layer] = new Set([...keywords, ...extra]);
    }
  }

  const parts = new Set(
    filePath.split(/[\\/]/).map((p) => p.toLowerCase())
  );

  for (const [layer, keywords] of Object.entries(heuristics)) {
    for (const kw of keywords) {
      if (parts.has(kw)) {
        return layer;
      }
    }
  }

  return "misc";
}
