import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';
import { saveState } from '../core/state-manager.js';

const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.cleanclaw', 'config.json');

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function runGlobalConfigWizard(rl: readline.Interface): Promise<void> {
  console.log('\nCleanClaw — First Run Setup\n');
  console.log('No global config found. Let\'s set up your defaults.\n');

  const providerRaw = await ask(rl, 'Default provider (anthropic/openai) [anthropic]: ');
  const provider = providerRaw || 'anthropic';

  const apiKey = await ask(rl, 'API key (or press Enter if using env var): ');

  const granularityRaw = await ask(rl, 'Default approval granularity (per-change/per-file/per-step) [per-file]: ');
  const granularity = granularityRaw || 'per-file';

  const globalConfig: Record<string, unknown> = { provider, approvalGranularity: granularity };
  if (apiKey) {
    globalConfig[provider] = { apiKey };
  }

  fs.mkdirSync(path.dirname(GLOBAL_CONFIG_PATH), { recursive: true });
  fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(globalConfig, null, 2), 'utf-8');
  console.log(`\nGlobal config written to ${GLOBAL_CONFIG_PATH}`);
}

async function runProjectInitFlow(rl: readline.Interface): Promise<void> {
  console.log('\nCleanClaw — Project Setup\n');

  let projectName = await ask(rl, 'Project name: ');
  while (!projectName) {
    projectName = await ask(rl, 'Project name (required): ');
  }

  const stackRaw = await ask(rl, 'Stack (dotnet/svelte/angular/blazor) [dotnet]: ');
  const stack = stackRaw || 'dotnet';

  const globalConfig = JSON.parse(fs.readFileSync(GLOBAL_CONFIG_PATH, 'utf-8')) as Record<string, unknown>;
  const provider = (globalConfig.provider as string) || 'anthropic';
  const approvalGranularity = (globalConfig.approvalGranularity as string) || 'per-file';

  const config: Record<string, unknown> = {
    projectName,
    provider,
    approvalGranularity,
    stack,
    plansDir: './plans',
    logFormat: 'markdown',
  };

  if (globalConfig[provider]) {
    config[provider] = globalConfig[provider];
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

export async function runSetupWizard(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const isFirstRun = !fs.existsSync(GLOBAL_CONFIG_PATH);

  if (isFirstRun) {
    await runGlobalConfigWizard(rl);

    const initNow = await ask(rl, '\nWould you like to initialise your first project now? [y/n]: ');
    if (initNow.toLowerCase() === 'y') {
      await runProjectInitFlow(rl);
    }
  } else {
    await runProjectInitFlow(rl);
  }

  rl.close();
}
