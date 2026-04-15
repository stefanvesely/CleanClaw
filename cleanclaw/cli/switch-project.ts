import fs from 'fs';
import path from 'path';
import { loadState, saveActiveProject } from '../core/state-manager.js';
import { appendToRegistry } from '../projectmap/project-registry.js';

export async function switchProject(projectPath: string): Promise<void> {
  const resolved = path.resolve(projectPath);

  if (!fs.existsSync(path.join(resolved, 'cleanclaw.config.json'))) {
    console.error(`Error: "${resolved}" is not a CleanClaw project (no cleanclaw.config.json found).`);
    console.error('Run "cleanclaw init" inside that directory first.');
    process.exit(1);
  }

  saveActiveProject(resolved);

  const state = loadState(resolved);
  const projectName = state?.projectName ?? path.basename(resolved);
  const lastTask = state ? `task${state.currentTaskId}${state.currentVariant}` : 'none';

  appendToRegistry(resolved, projectName, resolved);

  console.log(`Switched to ${projectName}. Last task: ${lastTask}.`);
}
