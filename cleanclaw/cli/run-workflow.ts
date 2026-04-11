import readline from 'readline';
import { getConfig } from '../core/config-loader.js';
import { runPipeline } from '../core/pipeline.js';
import { loadState, saveState } from '../core/state-manager.js';

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

export async function runWorkflow(taskDescription: string): Promise<void> {
  const config = getConfig();
  const state = loadState(process.cwd());

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(`\n[CleanClaw] Task: "${taskDescription}"`);
  const files = await ask(rl, 'Which files should be changed? (press Enter to let the agent decide): ');
  const context = await ask(rl, 'Any additional context? (press Enter to skip): ');
  rl.close();

  let fullDescription = taskDescription;
  if (files) fullDescription += `\n\nFiles to modify: ${files}`;
  if (context) fullDescription += `\n\nAdditional context: ${context}`;

  await runPipeline(fullDescription, config);

  saveState({
    projectName: config.projectName,
    currentTaskId: state?.currentTaskId ?? '01',
    currentVariant: 'A',
    plansDir: config.plansDir,
    lastUpdated: new Date().toISOString(),
  }, process.cwd());
}
