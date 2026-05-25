export interface CleanClawRouteSnapshot {
  provider: string | null;
  model: string | null;
  gatewayMode: 'gateway' | 'direct' | null;
  sandboxMode: string | null;
  sandboxName?: string | null;
}

export interface RouteChangePolicyDecision {
  allowed: boolean;
  changes: string[];
  approvalRequired: boolean;
  approvalText?: string;
}

export function checkVisibleRouteChange(input: {
  before: CleanClawRouteSnapshot;
  after: CleanClawRouteSnapshot;
  approvalText?: string;
}): RouteChangePolicyDecision {
  const changes = routeChanges(input.before, input.after);
  const approvalText = input.approvalText?.trim();
  const approvalRequired = changes.length > 0;

  return {
    allowed: !approvalRequired || Boolean(approvalText),
    changes,
    approvalRequired,
    ...(approvalText ? { approvalText } : {}),
  };
}

export function assertVisibleRouteChangeApproved(input: {
  before: CleanClawRouteSnapshot;
  after: CleanClawRouteSnapshot;
  approvalText?: string;
}): void {
  const decision = checkVisibleRouteChange(input);
  if (decision.allowed) return;
  throw new Error(`Provider/model/sandbox changes require approval: ${decision.changes.join('; ')}`);
}

export function formatRouteSnapshot(snapshot: CleanClawRouteSnapshot): string {
  return [
    `Provider: ${snapshot.provider ?? '(none)'}`,
    `Model: ${snapshot.model ?? '(none)'}`,
    `Gateway: ${snapshot.gatewayMode ?? '(unknown)'}`,
    `Sandbox: ${snapshot.sandboxMode ?? '(unknown)'}`,
    `Sandbox name: ${snapshot.sandboxName ?? '(none)'}`,
  ].join('\n');
}

function routeChanges(before: CleanClawRouteSnapshot, after: CleanClawRouteSnapshot): string[] {
  const changes: string[] = [];
  compare('provider', before.provider, after.provider, changes);
  compare('model', before.model, after.model, changes);
  compare('gateway', before.gatewayMode, after.gatewayMode, changes);
  compare('sandbox mode', before.sandboxMode, after.sandboxMode, changes);
  compare('sandbox name', before.sandboxName ?? null, after.sandboxName ?? null, changes);
  return changes;
}

function compare(label: string, before: string | null | undefined, after: string | null | undefined, changes: string[]): void {
  const left = before ?? '(none)';
  const right = after ?? '(none)';
  if (left !== right) {
    changes.push(`${label}: ${left} -> ${right}`);
  }
}
