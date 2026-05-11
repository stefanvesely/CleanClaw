import type { CleanClawConfig } from '../config/config-schema.js';
import { redactPlanSecrets } from '../plans/secret-redactor.js';

export interface CleanClawSessionLike {
  sessionId?: string | null;
  status?: string | null;
  mode?: string | null;
  agent?: string | null;
  sandboxName?: string | null;
  provider?: string | null;
  model?: string | null;
  endpointUrl?: string | null;
  credentialEnv?: string | null;
  preferredInferenceApi?: string | null;
  policyPresets?: string[] | null;
  messagingChannels?: string[] | null;
  lastStepStarted?: string | null;
  lastCompletedStep?: string | null;
  resumable?: boolean | null;
  metadata?: {
    gatewayName?: string | null;
    fromDockerfile?: string | null;
  } | null;
}

export interface CleanClawRuntimeContextInput {
  source: string;
  config: CleanClawConfig;
  activeRoot?: string | null;
  credentialEnv?: string | null;
  hasCredential?: boolean;
  session?: CleanClawSessionLike | null;
}

export interface CleanClawRuntimeContext {
  source: string;
  activeRoot: string | null;
  projectName: string;
  configProvider: string;
  configModel: string | null;
  session: {
    sessionId: string | null;
    status: string | null;
    mode: string | null;
    agent: string | null;
    sandboxName: string | null;
    lastStepStarted: string | null;
    lastCompletedStep: string | null;
    resumable: boolean | null;
  };
  blueprint: {
    profile: string | null;
    policyPresets: string[] | null;
    gatewayName: string | null;
    fromDockerfile: string | null;
  };
  auth: {
    provider: string | null;
    model: string | null;
    endpointUrl: string | null;
    credentialEnv: string | null;
    preferredInferenceApi: string | null;
    hasCredential: boolean;
  };
  runtime: {
    messagingChannels: string[] | null;
  };
}

export interface CleanClawRuntimeContextSummary {
  source: string;
  activeRoot: string | null;
  sessionId: string | null;
  agent: string | null;
  sandboxName: string | null;
  gatewayName: string | null;
  provider: string | null;
  model: string | null;
  credentialEnv: string | null;
  preferredInferenceApi: string | null;
  blueprintProfile: string | null;
  policyPresets: string[] | null;
  hasCredential: boolean;
}

function safeString(value: string | null | undefined): string | null {
  if (!value) return null;
  const redacted = redactPlanSecrets(value).trim();
  return redacted || null;
}

function safeArray(value: string[] | null | undefined): string[] | null {
  if (!Array.isArray(value)) return null;
  const cleaned = value.map(safeString).filter((entry): entry is string => Boolean(entry));
  return cleaned.length > 0 ? cleaned : null;
}

function configModel(config: CleanClawConfig): string | null {
  return config.anthropic?.model ?? config.openai?.model ?? null;
}

export function buildCleanClawRuntimeContext(input: CleanClawRuntimeContextInput): CleanClawRuntimeContext {
  const session = input.session ?? null;
  const sessionProvider = safeString(session?.provider);
  const configProvider = safeString(input.config.provider);

  return {
    source: safeString(input.source) ?? 'cleanclaw',
    activeRoot: safeString(input.activeRoot),
    projectName: safeString(input.config.projectName) ?? 'CleanClaw',
    configProvider: configProvider ?? 'unknown',
    configModel: safeString(configModel(input.config)),
    session: {
      sessionId: safeString(session?.sessionId),
      status: safeString(session?.status),
      mode: safeString(session?.mode),
      agent: safeString(session?.agent),
      sandboxName: safeString(session?.sandboxName),
      lastStepStarted: safeString(session?.lastStepStarted),
      lastCompletedStep: safeString(session?.lastCompletedStep),
      resumable: typeof session?.resumable === 'boolean' ? session.resumable : null,
    },
    blueprint: {
      profile: safeString(session?.preferredInferenceApi),
      policyPresets: safeArray(session?.policyPresets),
      gatewayName: safeString(session?.metadata?.gatewayName),
      fromDockerfile: safeString(session?.metadata?.fromDockerfile),
    },
    auth: {
      provider: sessionProvider ?? configProvider,
      model: safeString(session?.model) ?? safeString(configModel(input.config)),
      endpointUrl: safeString(session?.endpointUrl),
      credentialEnv: safeString(input.credentialEnv) ?? safeString(session?.credentialEnv),
      preferredInferenceApi: safeString(session?.preferredInferenceApi),
      hasCredential: input.hasCredential === true,
    },
    runtime: {
      messagingChannels: safeArray(session?.messagingChannels),
    },
  };
}

export function summarizeRuntimeContext(
  context: CleanClawRuntimeContext | null | undefined,
): CleanClawRuntimeContextSummary | null {
  if (!context) return null;
  return {
    source: context.source,
    activeRoot: context.activeRoot,
    sessionId: context.session.sessionId,
    agent: context.session.agent,
    sandboxName: context.session.sandboxName,
    gatewayName: context.blueprint.gatewayName,
    provider: context.auth.provider,
    model: context.auth.model,
    credentialEnv: context.auth.credentialEnv,
    preferredInferenceApi: context.auth.preferredInferenceApi,
    blueprintProfile: context.blueprint.profile,
    policyPresets: context.blueprint.policyPresets,
    hasCredential: context.auth.hasCredential,
  };
}

export function formatRuntimeContextMarkdown(context: CleanClawRuntimeContext | null | undefined): string {
  const summary = summarizeRuntimeContext(context);
  if (!summary) return '';

  return [
    '## Runtime Context',
    `- Source: ${summary.source}`,
    `- Active root: ${summary.activeRoot ?? '(unknown)'}`,
    `- Session id: ${summary.sessionId ?? '(none)'}`,
    `- Agent: ${summary.agent ?? '(none)'}`,
    `- Sandbox: ${summary.sandboxName ?? '(none)'}`,
    `- Gateway: ${summary.gatewayName ?? '(none)'}`,
    `- Provider: ${summary.provider ?? '(none)'}`,
    `- Model: ${summary.model ?? '(none)'}`,
    `- Credential env: ${summary.credentialEnv ?? '(none)'}`,
    `- Credential present: ${summary.hasCredential ? 'yes' : 'no'}`,
    `- Inference profile: ${summary.preferredInferenceApi ?? summary.blueprintProfile ?? '(none)'}`,
    `- Policy presets: ${summary.policyPresets?.join(', ') ?? '(none)'}`,
  ].join('\n');
}
