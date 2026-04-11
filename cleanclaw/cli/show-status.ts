import path from 'path';
import { loadActiveProject, loadState } from '../core/state-manager.js';

export async function showStatus(): Promise<void> {
  const projectDir = loadActiveProject() ?? process.cwd();
  const state = loadState(projectDir);

  if (!state) {
    console.log('No active CleanClaw project. Run "cleanclaw init" to initialise one.');
    return;
  }

  console.log(`\nActive project: ${state.projectName}`);
  console.log(`Directory:      ${projectDir}`);
  console.log(`Last task:      task${state.currentTaskId}${state.currentVariant}`);
  console.log(`Plans dir:      ${state.plansDir}`);
  console.log(`Last updated:   ${state.lastUpdated}`);
}
