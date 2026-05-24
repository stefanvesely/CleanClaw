import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';
import { saveState } from '../core/state-manager.js';
import { createProjectSettings, saveProjectSettings } from '../core/project-settings.js';
import { appendToRegistry } from '../projectmap/project-registry.js';
import type { CleanClawConfig } from '../config/config-schema.js';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { detectProjectMarkers } from '../core/project-markers.js';
import { formatNumberedPrompt, parseNumberedPromptSelection } from '../core/numbered-prompt.js';
import { formatStackInference, inferProjectStack } from '../core/stack-inference.js';
import { stackSelectionOptions } from '../core/stack-selection.js';
import {
  createProjectMapFreshnessPrompt,
  formatProjectMapFreshnessSummary,
} from '../projectmap/freshness-decision.js';
import { inspectProjectMapFreshness } from '../projectmap/manifest.js';
import {
  CLEANCLAW_PROVIDER_METADATA,
  CLEANCLAW_WIZARD_PROVIDER_IDS,
  type CleanClawProvider,
} from '../core/provider-metadata.js';

const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.cleanclaw', 'config.json');

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function runGlobalConfigWizard(
  rl: readline.Interface,
  logger: CleanClawLogger,
): Promise<void> {
  logger.info('\nCleanClaw â€” First Run Setup\n');
  logger.info('No global config found. Let\'s set up your defaults.\n');

  logger.info('Supported providers:');
  for (const providerId of CLEANCLAW_WIZARD_PROVIDER_IDS) {
    const provider = CLEANCLAW_PROVIDER_METADATA[providerId];
    logger.info(`  - ${provider.id}: ${provider.label}`);
  }
  logger.info('');

  const providerPrompt = `Default provider (${CLEANCLAW_WIZARD_PROVIDER_IDS.join('/')}) [nvidia-nim]: `;
  const providerRaw = await ask(rl, providerPrompt);
  const provider = (providerRaw || 'nvidia-nim') as CleanClawProvider;
  if (!CLEANCLAW_PROVIDER_METADATA[provider]?.wizardVisible) {
    throw new Error(`Unsupported provider "${provider}". Choose one of: ${CLEANCLAW_WIZARD_PROVIDER_IDS.join(', ')}`);
  }

  const granularityRaw = await ask(rl, 'Default approval granularity (per-change/per-file/per-step) [per-change]: ');
  const granularity = granularityRaw || 'per-change';

  const globalConfig: Record<string, unknown> = { provider, approvalGranularity: granularity };
  const providerMetadata = CLEANCLAW_PROVIDER_METADATA[provider];

  if (providerMetadata.bridgeFamily === 'openai') {
    const modelRaw = await ask(rl, `Default model [${providerMetadata.defaultModel}]: `);
    const baseUrlRaw = providerMetadata.defaultBaseURL
      ? await ask(rl, `${providerMetadata.label} base URL [${providerMetadata.defaultBaseURL}]: `)
      : await ask(rl, `${providerMetadata.label} base URL (leave blank for provider default): `);
    globalConfig.openai = {
      model: modelRaw || providerMetadata.defaultModel,
      ...(baseUrlRaw || providerMetadata.defaultBaseURL
        ? { baseURL: baseUrlRaw || providerMetadata.defaultBaseURL }
        : {}),
    };
  } else {
    const modelRaw = await ask(rl, `Default model [${providerMetadata.defaultModel}]: `);
    const baseUrlRaw = await ask(rl, `${providerMetadata.label} base URL (leave blank for provider default): `);
    globalConfig.anthropic = {
      model: modelRaw || providerMetadata.defaultModel,
      ...(baseUrlRaw ? { baseURL: baseUrlRaw } : {}),
    };
  }

  fs.mkdirSync(path.dirname(GLOBAL_CONFIG_PATH), { recursive: true });
  fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(globalConfig, null, 2), 'utf-8');
  logger.info(`\nGlobal config written to ${GLOBAL_CONFIG_PATH}`);
}

async function runProjectInitFlow(
  rl: readline.Interface,
  logger: CleanClawLogger,
): Promise<void> {
  logger.info('\nCleanClaw â€” Project Setup\n');

  let projectName = await ask(rl, 'Project name: ');
  while (!projectName) {
    projectName = await ask(rl, 'Project name (required): ');
  }

  const stack = await askProjectStack(rl, logger);

  const globalConfig = JSON.parse(fs.readFileSync(GLOBAL_CONFIG_PATH, 'utf-8')) as Record<string, unknown>;
  const provider = (globalConfig.provider as string) || 'anthropic';
  const approvalGranularity = (globalConfig.approvalGranularity as 'per-change' | 'per-file' | 'per-step') || 'per-change';

  const enableEmbeddingsRaw = await ask(rl, 'Enable ProjectMap embeddings? (y/n) [n]: ');
  const enableEmbeddings = enableEmbeddingsRaw.toLowerCase() === 'y';

  let embeddingsConfig: Record<string, unknown> | undefined;
  if (enableEmbeddings) {
    const embProviderRaw = await ask(rl, 'Embeddings provider (local/openai/vllm-local/ollama-local/http) [local]: ');
    const embProvider = embProviderRaw || 'local';

    const defaultEmbeddingModel = embProvider === 'local' ? 'Xenova/all-MiniLM-L6-v2' : 'text-embedding-3-small';
    const embModel = await ask(rl, `Embeddings model [${defaultEmbeddingModel}]: `);
    const embBaseUrl = await ask(rl, 'Base URL (leave blank for provider default): ');

    embeddingsConfig = { provider: embProvider, model: embModel || defaultEmbeddingModel };
    if (embBaseUrl) {
      embeddingsConfig.baseUrl = embBaseUrl;
    }
  }

  const config: Record<string, unknown> = {
    projectName,
    provider,
    approvalGranularity,
    stack,
    plansDir: './plans',
    logFormat: 'markdown',
    ...(embeddingsConfig ? { embeddings: embeddingsConfig } : {}),
  };

  fs.writeFileSync('cleanclaw.config.json', JSON.stringify(config, null, 2), 'utf-8');
  fs.mkdirSync('./plans', { recursive: true });
  saveProjectSettings(process.cwd(), createProjectSettings({
    projectRoot: process.cwd(),
    projectName,
    approvalGranularity,
    plansDir: './plans',
    selectedStack: stack,
  }));

  saveState({
    projectName,
    currentTaskId: '00',
    currentVariant: 'A',
    plansDir: './plans',
    lastUpdated: new Date().toISOString(),
    iterationCount: 0,
    resumable: false,
    lastCompletedStep: 0,
  }, process.cwd());

  appendToRegistry(process.cwd(), projectName, process.cwd());

  logger.info(`\nInitialised. Config written to cleanclaw.config.json`);

  if (config.embeddings) {
    await askProjectMapBuildDecision(rl, config as unknown as CleanClawConfig, logger);
  }

  logger.info('Run: cleanclaw run "Your task description"');
}

async function askProjectMapBuildDecision(
  rl: readline.Interface,
  config: CleanClawConfig,
  logger: CleanClawLogger,
): Promise<void> {
  const freshness = inspectProjectMapFreshness(process.cwd());
  logger.info(`\n${formatProjectMapFreshnessSummary(freshness)}`);

  const prompt = createProjectMapFreshnessPrompt(freshness);
  if (!prompt) return;

  let selection = parseNumberedPromptSelection(await ask(rl, formatNumberedPrompt(prompt)), prompt);
  while (selection.kind === 'invalid' || selection.kind === 'natural-language' || selection.kind === 'control') {
    if (selection.kind === 'control' && (selection.control === 'cancel' || selection.control === 'exit')) {
      logger.info('ProjectMap build skipped.');
      return;
    }
    const retry = selection.kind === 'invalid' ? `\n${selection.reason}\n` : '\nPlease choose one of the numbered options.\n';
    selection = parseNumberedPromptSelection(await ask(rl, `${retry}${formatNumberedPrompt(prompt)}`), prompt);
  }

  if (selection.option.id === 'build' || selection.option.id === 'rebuild') {
    const { build } = await import('../projectmap/build.js');
    await build(process.cwd(), config, logger);
    return;
  }

  if (selection.option.id === 'continue-stale') {
    logger.info('Continuing with the existing stale ProjectMap for now.');
    return;
  }

  logger.info('ProjectMap build skipped.');
}

async function askProjectStack(rl: readline.Interface, logger: CleanClawLogger): Promise<string> {
  const inference = inferProjectStack(detectProjectMarkers(process.cwd()));
  if (!inference.bestGuess) {
    const stackRaw = await ask(rl, 'Stack (dotnet/svelte/angular/blazor) [dotnet]: ');
    return stackRaw || 'dotnet';
  }

  logger.info(formatStackInference(inference));
  const prompt = {
    question: 'Confirm the project stack CleanClaw should use.',
    options: stackSelectionOptions(inference),
    defaultId: inference.bestGuess.stack,
    allowNaturalLanguage: true,
  };
  const selection = parseNumberedPromptSelection(await ask(rl, formatNumberedPrompt(prompt)), prompt);

  if (selection.kind === 'option' && selection.option.id !== 'override') {
    return selection.option.id;
  }

  if (selection.kind === 'natural-language' && selection.text.trim()) {
    return selection.text.trim();
  }

  if (selection.kind === 'option' && selection.option.id === 'override') {
    const override = await ask(rl, 'Stack id to use: ');
    return override || inference.bestGuess.stack;
  }

  return inference.bestGuess.stack;
}

export async function runSetupWizard(
  logger: CleanClawLogger = createConsoleLogger(),
): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const isFirstRun = !fs.existsSync(GLOBAL_CONFIG_PATH);

  if (isFirstRun) {
    await runGlobalConfigWizard(rl, logger);

    const initNow = await ask(rl, '\nWould you like to initialise your first project now? [y/n]: ');
    if (initNow.toLowerCase() === 'y') {
      await runProjectInitFlow(rl, logger);
    }
  } else {
    await runProjectInitFlow(rl, logger);
  }

  rl.close();
}

