import { isOpenshellAvailable } from '../wizard/wizard-delegator.js';
import { createConsoleLogger, type CleanClawLogger } from './logger.js';

export async function applyRootPolicy(
  activeRoot: string,
  logger: CleanClawLogger = createConsoleLogger(),
): Promise<void> {
  const sandboxActive = await isOpenshellAvailable();

  if (!sandboxActive) {
    logger.info(`[CleanClaw] Enforcement: software boundary only (openshell not available). Active root: ${activeRoot}`);
    return;
  }

  logger.info('[CleanClaw] Enforcement: software boundary active. Openshell sandbox detected - kernel Landlock available after Phase 8 (run-in-container) is implemented.');
}
