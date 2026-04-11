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

  console.log(`\n[CleanClaw] Planning task: "${taskDescription}"`);
  console.log('Answer each question — press Enter to skip optional ones.\n');

  const why        = await ask(rl, '1. Why does this task matter / what problem does it solve? ');
  const files      = await ask(rl, '2. Which files should be changed? (Enter = let the agent decide) ');
  const criteria   = await ask(rl, '3. Acceptance criteria — what does "done" look like? ');
  const outOfScope = await ask(rl, '4. Out of scope — what should NOT change? (Enter to skip) ');
  rl.close();

  const parts: string[] = [`Task: ${taskDescription}`];
  if (why)        parts.push(`Why: ${why}`);
  if (files)      parts.push(`Files to modify: ${files}`);
  if (criteria)   parts.push(`Acceptance criteria: ${criteria}`);
  if (outOfScope) parts.push(`Out of scope: ${outOfScope}`);

  const fullDescription = parts.join('\n\n');

  await runPipeline(fullDescription, config);

  saveState({
    projectName: config.projectName,
    currentTaskId: state?.currentTaskId ?? '01',
    currentVariant: 'A',
    plansDir: config.plansDir,
    lastUpdated: new Date().toISOString(),
  }, process.cwd());
}
