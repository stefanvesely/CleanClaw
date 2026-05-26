/**
 * CleanClaw startup process skeleton.
 *
 * This file is intentionally method-only for review. The methods below name the
 * startup moving parts without executing checks, reading config, writing files,
 * calling models, or changing project state.
 */

import { createRequire } from 'module';
import { getConfig, getGlobalConfigStatus } from './config-loader.js';
import { runGlobalSetupWizard } from '../cli/setup-wizard.js';

export type StartupStepStatus = 'not-implemented' | 'ready' | 'needs-user-action' | 'failed' | 'skipped';

export interface StartupStepResponse {
  step: string;
  status: StartupStepStatus;
  message: string;
  next: string[];
  choices?: StartupStepChoice[];
}

export interface StartupStepChoice {
  id: string;
  label: string;
  description: string;
}

export interface StartupProcessResponse {
  status: 'not-implemented' | 'continue-to-project-intake' | 'blocked-for-recovery';
  steps: StartupStepResponse[];
  decisionTree: string[];
}

interface LocalLLMSettings {
  provider: string;
  model: string;
  baseURL: string;
  apiKey: string;
}

interface FrontierLLMSettings {
  provider: string;
  model: string;
  credentialEnv: string;
  providerLabel: string;
}

const DEFAULT_LOCAL_LLM: LocalLLMSettings = {
  provider: 'ollama-local',
  model: 'qwen2.5:7b',
  baseURL: 'http://127.0.0.1:11434/v1',
  apiKey: 'ollama',
};

let startupLocalLLMSettings: LocalLLMSettings = DEFAULT_LOCAL_LLM;
let startupFrontierLLMSettings: FrontierLLMSettings | null = null;
const require = createRequire(import.meta.url);

function EmptyStep(step: string, next: string[] = []): StartupStepResponse {
  return {
    step,
    status: 'not-implemented',
    message: 'Method placeholder only. No startup work has been executed.',
    next,
  };
}

/**
 * Entry point for startup housekeeping before project/task intake begins.
 */
export async function StartCleanClawStartupProcess(): Promise<StartupProcessResponse> {
  const steps: StartupStepResponse[] = [];

  const configuration = await LoadStartupConfiguration();
  steps.push(configuration);

  const localLLM = VerifyLocalLLM();
  steps.push(localLLM);

  if (localLLM.status !== 'ready') {
    steps.push(PromptForLocalLLMSetup());
    return {
      status: 'blocked-for-recovery',
      steps,
      decisionTree: [
        'Load startup configuration.',
        'Verify local LLM.',
        'If local LLM is not ready, ask the user how to recover.',
        'Stop before project intake until a local LLM is ready.',
      ],
    };
  }

  while (true) {
    const frontierModels = VerifyFrontierModels();
    steps.push(frontierModels);
    if (frontierModels.status === 'ready') {
      break;
    }

    const frontierSetup = await PromptForFrontierAPIKey();
    steps.push(frontierSetup);
    if (frontierSetup.status !== 'ready') {
      break;
    }
  }

  const nemoRuntime = await VerifyNemoClawRuntime();
  steps.push(nemoRuntime);

  if (nemoRuntime.status === 'ready') {
    steps.push(VerifyNemoClawGatewayModel());
  }

  const blockingStep = steps.find(step =>
    step.status === 'failed'
    || step.status === 'needs-user-action'
    || step.status === 'not-implemented',
  );
  if (!blockingStep) {
    return {
      status: 'continue-to-project-intake',
      steps,
      decisionTree: [
        'Load startup configuration.',
        'Verify local LLM and require it to be ready.',
        'Verify configured frontier models.',
        'Ask for frontier API keys if none are usable.',
        'Verify NemoClaw/OpenShell runtime.',
        'If NemoClaw is ready, verify gateway model route.',
        'Continue to project intake only if startup mode is ready.',
      ],
    };
  }

  return {
    status: 'blocked-for-recovery',
    steps,
    decisionTree: [
      'Load startup configuration.',
      'Verify all model/runtime routes.',
      'Stop with recovery steps when startup mode is not ready.',
    ],
  };
}

/**
 * Load global, project, environment, and runtime settings needed for startup.
 */
export async function LoadStartupConfiguration(): Promise<StartupStepResponse> {
  const globalConfigStatus = getGlobalConfigStatus();
  if (!globalConfigStatus.valid) {
    const reason = globalConfigStatus.exists
      ? `global config is invalid: ${globalConfigStatus.error ?? 'unknown parse error'}`
      : 'global config does not exist';
    return runGlobalSetupAndLoadStartupSettings(reason);
  }

  try {
    return loadConfiguredStartupSettings('CleanClaw configuration loaded.');
  } catch (error) {
    const firstError = error instanceof Error ? error.message : String(error);
    return runGlobalSetupAndLoadStartupSettings(`configuration could not be loaded: ${firstError}`);
  }
}

async function runGlobalSetupAndLoadStartupSettings(reason: string): Promise<StartupStepResponse> {
  try {
    await runGlobalSetupWizard();
    return loadConfiguredStartupSettings(
      `CleanClaw global setup was run because ${reason}.`,
    );
  } catch (setupError) {
    startupLocalLLMSettings = DEFAULT_LOCAL_LLM;
    startupFrontierLLMSettings = null;
    return {
      step: 'LoadStartupConfiguration',
      status: 'needs-user-action',
      message: `CleanClaw global setup did not complete after ${reason}. Setup error: ${setupError instanceof Error ? setupError.message : String(setupError)}`,
      next: [],
    };
  }
}

function loadConfiguredStartupSettings(prefix: string): StartupStepResponse {
  const config = getConfig();
  const localInference = loadNemoClawLocalInference();
  const model = config.localModel?.model
    ?? localInference.getDefaultOllamaModel?.(null)
    ?? DEFAULT_LOCAL_LLM.model;
  const baseURL = config.localModel?.baseURL
    ?? localInference.getLocalProviderValidationBaseUrl?.(config.localModel?.provider ?? DEFAULT_LOCAL_LLM.provider)
    ?? DEFAULT_LOCAL_LLM.baseURL;

  startupLocalLLMSettings = {
    provider: config.localModel?.provider ?? DEFAULT_LOCAL_LLM.provider,
    model,
    baseURL,
    apiKey: config.localModel?.apiKey ?? DEFAULT_LOCAL_LLM.apiKey,
  };

  startupFrontierLLMSettings = resolveFrontierLLMSettings(config.provider);

  return {
    step: 'LoadStartupConfiguration',
    status: 'ready',
    message: [
      prefix,
      `Local LLM configuration loaded: ${startupLocalLLMSettings.provider} ${startupLocalLLMSettings.model} at ${startupLocalLLMSettings.baseURL}.`,
      startupFrontierLLMSettings
        ? `Frontier provider loaded through NemoClaw config: ${startupFrontierLLMSettings.providerLabel} ${startupFrontierLLMSettings.model}.`
        : 'No frontier provider is configured; startup will continue local-first.',
    ].join(' '),
    next: ['VerifyLocalLLM'],
  };
}

/**
 * Verify that a local LLM is available and can answer a tiny sanity prompt.
 */
export function VerifyLocalLLM(): StartupStepResponse {
  const localInference = loadNemoClawLocalInference();
  const health = localInference.probeLocalProviderHealth?.(startupLocalLLMSettings.provider);
  if (!health?.ok) {
    return {
      step: 'VerifyLocalLLM',
      status: 'needs-user-action',
      message: health?.detail ?? `Local inference provider is not reachable: ${startupLocalLLMSettings.provider}.`,
      next: ['PromptForLocalLLMSetup'],
    };
  }

  if (startupLocalLLMSettings.provider === 'ollama-local') {
    const modelValidation = localInference.validateOllamaModel?.(startupLocalLLMSettings.model);
    if (!modelValidation?.ok) {
      return {
        step: 'VerifyLocalLLM',
        status: 'needs-user-action',
        message: modelValidation?.message ?? `Ollama is reachable, but model '${startupLocalLLMSettings.model}' did not pass validation.`,
        next: ['PromptForLocalLLMSetup'],
      };
    }
  }

  return {
    step: 'VerifyLocalLLM',
    status: 'ready',
    message: `Local LLM verified through NemoClaw local inference: ${startupLocalLLMSettings.provider} ${startupLocalLLMSettings.model}.`,
    next: ['VerifyFrontierModels'],
  };
}

function loadNemoClawLocalInference(): {
  getDefaultOllamaModel?: (gpu?: unknown) => string;
  getLocalProviderValidationBaseUrl?: (provider: string) => string | null;
  probeLocalProviderHealth?: (provider: string) => { ok: boolean; detail: string } | null;
  validateOllamaModel?: (model: string) => { ok: boolean; message?: string };
} {
  return require('../../lib/local-inference.js');
}

function loadNemoClawInferenceConfig(): {
  getProviderSelectionConfig?: (provider: string, model?: string) => {
    model: string;
    credentialEnv: string;
    provider: string;
    providerLabel: string;
  } | null;
  parseGatewayInference?: (output: string | null | undefined) => {
    provider: string | null;
    model: string | null;
  } | null;
} {
  return require('../../lib/inference-config.js');
}

function loadNemoClawInferenceHealth(): {
  probeRemoteProviderHealth?: (provider: string) => {
    ok: boolean;
    probed: boolean;
    providerLabel: string;
    endpoint: string;
    detail: string;
  } | null;
} {
  return require('../../lib/inference-health.js');
}

function loadNemoClawCredentials(): {
  resolveProviderCredential?: (envName: string) => string | null;
} {
  return require('../../lib/credentials.js');
}

function loadNemoClawOnboardProviders(): {
  LOCAL_INFERENCE_PROVIDERS?: string[];
  REMOTE_PROVIDER_CONFIG?: Record<string, {
    label: string;
    providerName: string;
    credentialEnv: string;
    defaultModel: string;
    helpUrl?: string | null;
  }>;
  getEffectiveProviderName?: (providerKey: string) => string | null;
} {
  return require('../../lib/onboard-providers.js');
}

function loadNemoClawOnboard(): {
  getGatewayReuseState?: (
    statusOutput?: string,
    gwInfoOutput?: string,
    activeGatewayInfoOutput?: string,
  ) => string;
  getInstalledOpenshellVersion?: () => string | null;
  isGatewayHealthy?: (
    statusOutput?: string,
    gwInfoOutput?: string,
    activeGatewayInfoOutput?: string,
  ) => boolean;
  runCaptureOpenshell?: (args: string[], opts?: { ignoreError?: boolean }) => string;
  startGatewayForRecovery?: (gpu: unknown) => Promise<void>;
  setupNim?: (gpu: unknown, sandboxName?: string | null) => Promise<{
    model: string | null;
    provider: string;
    endpointUrl: string | null;
    credentialEnv: string | null;
  }>;
  setupInference?: (
    sandboxName: string | null,
    model: string,
    provider: string,
    endpointUrl?: string | null,
    credentialEnv?: string | null,
  ) => Promise<{ ok: true; retry?: undefined } | { retry: 'selection' }>;
} {
  return require('../../lib/onboard.js');
}

function resolveFrontierLLMSettings(providerKey: string): FrontierLLMSettings | null {
  const onboardProviders = loadNemoClawOnboardProviders();
  const inferenceConfig = loadNemoClawInferenceConfig();
  const provider = onboardProviders.getEffectiveProviderName?.(providerKey) ?? providerKey;
  if (onboardProviders.LOCAL_INFERENCE_PROVIDERS?.includes(provider)) return null;

  const selection = inferenceConfig.getProviderSelectionConfig?.(provider);
  if (!selection) return null;

  const remoteProvider = Object.values(onboardProviders.REMOTE_PROVIDER_CONFIG ?? {})
    .find(candidate => candidate.providerName === provider);

  return {
    provider,
    model: selection.model,
    credentialEnv: remoteProvider?.credentialEnv ?? selection.credentialEnv,
    providerLabel: selection.providerLabel,
  };
}

/**
 * Ask the user how to recover when no local LLM is available.
 */
export function PromptForLocalLLMSetup(): StartupStepResponse {
  const provider = startupLocalLLMSettings.provider;
  const model = startupLocalLLMSettings.model;

  if (provider === 'vllm-local') {
    return {
      step: 'PromptForLocalLLMSetup',
      status: 'needs-user-action',
      message: [
        'Local vLLM is required before CleanClaw can continue.',
        'To recover:',
        '1. Start your vLLM OpenAI-compatible server.',
        '2. Make sure it is reachable at http://127.0.0.1:8000/v1, or update CleanClaw global setup with the correct URL.',
        '3. Confirm /v1/models responds.',
        '4. Run cleanclaw again.',
      ].join('\n'),
      next: ['VerifyLocalLLM'],
    };
  }

  return {
    step: 'PromptForLocalLLMSetup',
    status: 'needs-user-action',
    message: [
      'Local Ollama is required before CleanClaw can continue.',
      'To recover:',
      '1. Install Ollama from https://ollama.com/download.',
      '2. Start Ollama.',
      `3. Pull the configured model: ollama pull ${model}`,
      '4. Confirm Ollama is responding: ollama list',
      '5. Run cleanclaw again.',
    ].join('\n'),
    next: ['VerifyLocalLLM'],
  };
}

/**
 * Verify configured frontier providers and decide which ones are usable.
 */
export function VerifyFrontierModels(): StartupStepResponse {
  if (!startupFrontierLLMSettings) {
    return {
      step: 'VerifyFrontierModels',
      status: 'skipped',
      message: 'No frontier provider is configured. CleanClaw will stay local-first until the user approves frontier setup.',
      next: ['VerifyNemoClawRuntime'],
    };
  }

  const credential = loadNemoClawCredentials()
    .resolveProviderCredential?.(startupFrontierLLMSettings.credentialEnv)
    ?? process.env[startupFrontierLLMSettings.credentialEnv];
  if (!credential) {
    return {
      step: 'VerifyFrontierModels',
      status: 'needs-user-action',
      message: `Missing ${startupFrontierLLMSettings.credentialEnv} for ${startupFrontierLLMSettings.providerLabel}.`,
      next: ['PromptForFrontierAPIKey'],
    };
  }

  const health = loadNemoClawInferenceHealth()
    .probeRemoteProviderHealth?.(startupFrontierLLMSettings.provider);
  if (!health) {
    return {
      step: 'VerifyFrontierModels',
      status: 'needs-user-action',
      message: `NemoClaw does not have a remote health probe for ${startupFrontierLLMSettings.provider}.`,
      next: ['PromptForFrontierAPIKey', 'VerifyNemoClawRuntime'],
    };
  }

  if (!health.ok) {
    return {
      step: 'VerifyFrontierModels',
      status: 'failed',
      message: health.detail,
      next: ['PromptForFrontierAPIKey'],
    };
  }

  return {
    step: 'VerifyFrontierModels',
    status: 'ready',
    message: `${startupFrontierLLMSettings.providerLabel} frontier route is available through NemoClaw config: ${startupFrontierLLMSettings.provider} ${startupFrontierLLMSettings.model}. ${health.detail}`,
    next: ['VerifyNemoClawRuntime'],
  };
}

/**
 * Ask for an API key, test it, and only later save it if the test succeeds.
 */
export async function PromptForFrontierAPIKey(): Promise<StartupStepResponse> {
  try {
    const onboard = loadNemoClawOnboard();
    if (!onboard.setupNim || !onboard.setupInference) {
      return {
        step: 'PromptForFrontierAPIKey',
        status: 'needs-user-action',
        message: 'NemoClaw setup is not available. CleanClaw cannot configure a frontier route until NemoClaw setup can run.',
        next: ['VerifyFrontierModels'],
      };
    }

    const selection = await onboard.setupNim(null, null);
    if (!selection.model) {
      return {
        step: 'PromptForFrontierAPIKey',
        status: 'needs-user-action',
        message: 'NemoClaw setup did not return a model. Choose a frontier provider/model before CleanClaw can continue.',
        next: ['VerifyFrontierModels'],
      };
    }
    const result = await onboard.setupInference(
      null,
      selection.model,
      selection.provider,
      selection.endpointUrl,
      selection.credentialEnv,
    );

    if ('retry' in result && result.retry === 'selection') {
      return {
        step: 'PromptForFrontierAPIKey',
        status: 'needs-user-action',
        message: 'NemoClaw setup asked to choose a provider/model again. CleanClaw needs the user to rerun frontier setup.',
        next: ['VerifyFrontierModels'],
      };
    }

    const frontierSettings = resolveFrontierLLMSettings(selection.provider);
    if (!frontierSettings) {
      return {
        step: 'PromptForFrontierAPIKey',
        status: 'needs-user-action',
        message: `NemoClaw setup selected ${selection.provider}, but CleanClaw needs a frontier provider before startup can continue.`,
        next: ['VerifyFrontierModels'],
      };
    }

    startupFrontierLLMSettings = frontierSettings;
    return {
      step: 'PromptForFrontierAPIKey',
      status: 'ready',
      message: `NemoClaw setup configured inference route: ${selection.provider} ${selection.model}.`,
      next: ['VerifyFrontierModels'],
    };
  } catch (error) {
    return {
      step: 'PromptForFrontierAPIKey',
      status: 'needs-user-action',
      message: `NemoClaw setup could not complete. If no API key is available, enter one through NemoClaw setup and retry. ${error instanceof Error ? error.message : String(error)}`,
      next: ['VerifyFrontierModels'],
    };
  }
}

/**
 * Check whether NemoClaw/OpenShell is installed, running, and reachable.
 */
export async function VerifyNemoClawRuntime(): Promise<StartupStepResponse> {
  try {
    const onboard = loadNemoClawOnboard();
    const openshellVersion = onboard.getInstalledOpenshellVersion?.() ?? null;
    if (!openshellVersion) {
      return {
        step: 'VerifyNemoClawRuntime',
        status: 'needs-user-action',
        message: 'OpenShell CLI was not found. NemoClaw runtime cannot be verified until OpenShell is installed.',
        next: [],
      };
    }

    if (!onboard.runCaptureOpenshell || !onboard.isGatewayHealthy) {
      return {
        step: 'VerifyNemoClawRuntime',
        status: 'needs-user-action',
        message: 'NemoClaw runtime helpers are not available. CleanClaw cannot verify the OpenShell gateway.',
        next: [],
      };
    }

    const statusOutput = onboard.runCaptureOpenshell(['status'], { ignoreError: true });
    const gatewayInfo = onboard.runCaptureOpenshell(['gateway', 'info', '-g', 'nemoclaw'], { ignoreError: true });
    const activeGatewayInfo = onboard.runCaptureOpenshell(['gateway', 'info'], { ignoreError: true });
    const gatewayHealthy = onboard.isGatewayHealthy(statusOutput, gatewayInfo, activeGatewayInfo);

    if (!gatewayHealthy) {
      await onboard.startGatewayForRecovery?.(null);
      const retryStatusOutput = onboard.runCaptureOpenshell(['status'], { ignoreError: true });
      const retryGatewayInfo = onboard.runCaptureOpenshell(['gateway', 'info', '-g', 'nemoclaw'], { ignoreError: true });
      const retryActiveGatewayInfo = onboard.runCaptureOpenshell(['gateway', 'info'], { ignoreError: true });
      const retryGatewayHealthy = onboard.isGatewayHealthy(retryStatusOutput, retryGatewayInfo, retryActiveGatewayInfo);

      if (retryGatewayHealthy) {
        return {
          step: 'VerifyNemoClawRuntime',
          status: 'ready',
          message: `OpenShell ${openshellVersion} is installed and the NemoClaw gateway was started for recovery.`,
          next: ['VerifyNemoClawGatewayModel'],
        };
      }

      const gatewayState = onboard.getGatewayReuseState?.(retryStatusOutput, retryGatewayInfo, retryActiveGatewayInfo) ?? 'unknown';
      return {
        step: 'VerifyNemoClawRuntime',
        status: 'needs-user-action',
        message: `OpenShell ${openshellVersion} is installed, but the NemoClaw gateway is not ready. Gateway state: ${gatewayState}.`,
        next: [],
      };
    }

    return {
      step: 'VerifyNemoClawRuntime',
      status: 'ready',
      message: `OpenShell ${openshellVersion} is installed and the NemoClaw gateway is reachable.`,
      next: ['VerifyNemoClawGatewayModel'],
    };
  } catch (error) {
    return {
      step: 'VerifyNemoClawRuntime',
      status: 'failed',
      message: `NemoClaw runtime verification failed: ${error instanceof Error ? error.message : String(error)}`,
      next: [],
    };
  }
}

/**
 * Check whether the NemoClaw gateway inference route, the active model/provider path inside OpenShell, can answer a sanity prompt.
 */
export function VerifyNemoClawGatewayModel(): StartupStepResponse {
  try {
    const onboard = loadNemoClawOnboard();
    const inferenceConfig = loadNemoClawInferenceConfig();

    if (!onboard.runCaptureOpenshell || !inferenceConfig.parseGatewayInference) {
      return {
        step: 'VerifyNemoClawGatewayModel',
        status: 'needs-user-action',
        message: 'NemoClaw gateway route helpers are not available. CleanClaw cannot verify the active inference route.',
        next: [],
      };
    }

    const output = onboard.runCaptureOpenshell(['inference', 'get'], { ignoreError: true });
    const route = inferenceConfig.parseGatewayInference(output);
    if (!route?.provider || !route.model) {
      return {
        step: 'VerifyNemoClawGatewayModel',
        status: 'needs-user-action',
        message: 'NemoClaw gateway inference route is not configured.',
        next: [],
      };
    }

    return {
      step: 'VerifyNemoClawGatewayModel',
      status: 'ready',
      message: `NemoClaw gateway inference route is configured: ${route.provider} ${route.model}.`,
      next: [],
    };
  } catch (error) {
    return {
      step: 'VerifyNemoClawGatewayModel',
      status: 'failed',
      message: `NemoClaw gateway route verification failed: ${error instanceof Error ? error.message : String(error)}`,
      next: [],
    };
  }
}
