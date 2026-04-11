import { getConfig } from '../core/config-loader.js';
import { runPipeline } from '../core/pipeline.js';
import { loadState, saveState } from '../core/state-manager.js';

export async function runWorkflow(taskDescription: string): Promise<void> {
  const config = getConfig();
  const state = loadState(process.cwd());

  await runPipeline(taskDescription, config);

  saveState({
    projectName: config.projectName,
    currentTaskId: state?.currentTaskId ?? '01',
    currentVariant: 'A',
    plansDir: config.plansDir,
    lastUpdated: new Date().toISOString(),
  }, process.cwd());
}
