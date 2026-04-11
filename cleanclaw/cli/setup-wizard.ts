import fs from 'fs';
import readline from 'readline';
import { saveState } from '../core/state-manager.js';

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

export async function runSetupWizard(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\nCleanClaw — Project Setup\n');

  let projectName = await ask(rl, 'Project name: ');
  while (!projectName) {
    projectName = await ask(rl, 'Project name (required): ');
  }

  const providerRaw = await ask(rl, 'Provider (anthropic/openai) [anthropic]: ');
  const provider = providerRaw || 'anthropic';

  const apiKey = await ask(rl, 'API key (or press Enter if using env var): ');

  const granularityRaw = await ask(rl, 'Approval granularity (per-change/per-file/per-step) [per-file]: ');
  const approvalGranularity = granularityRaw || 'per-file';

  const stackRaw = await ask(rl, 'Stack (dotnet/svelte/angular/blazor) [dotnet]: ');
  const stack = stackRaw || 'dotnet';

  rl.close();

  const config: Record<string, unknown> = {
    projectName,
    provider,
    approvalGranularity,
    stack,
    plansDir: './plans',
    logFormat: 'markdown',
  };

  if (apiKey) {
    config[provider] = { apiKey };
  }

  fs.writeFileSync('cleanclaw.config.json', JSON.stringify(config, null, 2), 'utf-8');
  fs.mkdirSync('./plans', { recursive: true });

  saveState({
    projectName,
    currentTaskId: '00',
    currentVariant: 'A',
    plansDir: './plans',
    lastUpdated: new Date().toISOString(),
  }, process.cwd());

  console.log(`\nInitialised. Config written to cleanclaw.config.json`);
  console.log('Run: cleanclaw run "Your task description"');
}
