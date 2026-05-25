import { providerMetadata } from './provider-metadata.js';

export type ModelRoleName = 'planner' | 'coder' | 'reviewer' | 'local-coder' | 'embedding';

export interface ModelRoleRoute {
  role: ModelRoleName;
  provider: string;
  model: string;
  reason: string;
}

export interface ModelRolePolicyInput {
  defaultProvider: string;
  defaultModel: string;
  routes?: ModelRoleRoute[];
  requireReviewer?: boolean;
  localOnly?: boolean;
}

export interface ModelRolePolicyDecision {
  valid: boolean;
  routes: ModelRoleRoute[];
  missing: string[];
  warnings: string[];
}

const LOCAL_PROVIDERS = new Set(['vllm-local', 'ollama-local']);

export function resolveModelRolePolicy(input: ModelRolePolicyInput): ModelRolePolicyDecision {
  const missing: string[] = [];
  const warnings: string[] = [];
  const routes = normalizeRoutes(input);

  for (const route of routes) {
    if (!route.provider.trim()) missing.push(`${route.role} provider`);
    if (!route.model.trim()) missing.push(`${route.role} model`);
    if (!providerMetadata(route.provider)) warnings.push(`unknown provider for ${route.role}: ${route.provider}`);
    if (isLocalRole(route.role) && !LOCAL_PROVIDERS.has(route.provider)) {
      missing.push(`${route.role} must use a local provider`);
    }
    if (input.localOnly && !LOCAL_PROVIDERS.has(route.provider)) {
      missing.push(`${route.role} must stay local in local-only mode`);
    }
  }

  if (input.requireReviewer && !routes.some(route => route.role === 'reviewer' && route.model.trim())) {
    missing.push('reviewer role');
  }

  return {
    valid: missing.length === 0,
    routes,
    missing: unique(missing),
    warnings: unique(warnings),
  };
}

function normalizeRoutes(input: ModelRolePolicyInput): ModelRoleRoute[] {
  const explicit = input.routes ?? [];
  const routes = [...explicit];

  if (!routes.some(route => route.role === 'planner')) {
    routes.push(defaultRoute('planner', input, 'Default provider used for planning until a planner role is configured.'));
  }
  if (!routes.some(route => route.role === 'coder')) {
    routes.push(defaultRoute('coder', input, 'Default provider used for coding until a coder role is configured.'));
  }

  return routes;
}

function defaultRoute(
  role: ModelRoleName,
  input: ModelRolePolicyInput,
  reason: string,
): ModelRoleRoute {
  return {
    role,
    provider: input.defaultProvider,
    model: input.defaultModel,
    reason,
  };
}

function isLocalRole(role: ModelRoleName): boolean {
  return role === 'local-coder' || role === 'embedding';
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
