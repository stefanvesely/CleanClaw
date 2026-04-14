import { isOpenshellAvailable } from '../wizard/wizard-delegator.js';

export async function applyRootPolicy(activeRoot: string): Promise<void> {
  const sandboxActive = await isOpenshellAvailable();

  if (!sandboxActive) {
    // DEGRADED MODE: no sandbox — filesystem boundary is software-enforced only
    console.log(`[CleanClaw] Enforcement: software boundary only (openshell not available). Active root: ${activeRoot}`);
    return;
  }

  // Sandbox is available but CleanClaw runs on the host — kernel-level Landlock
  // requires CleanClaw to execute inside the container (pending Phase 8).
  // Software boundary enforcement remains the active layer.
  console.log(`[CleanClaw] Enforcement: software boundary active. Openshell sandbox detected — kernel Landlock available after Phase 8 (run-in-container) is implemented.`);
}
