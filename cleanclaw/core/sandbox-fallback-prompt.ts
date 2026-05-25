import type { NumberedPromptConfig } from './numbered-prompt.js';

export interface SandboxFallbackPromptInput {
  sandboxName?: string | null;
  reason: string;
}

export function createSandboxFallbackPrompt(input: SandboxFallbackPromptInput): NumberedPromptConfig {
  const sandbox = input.sandboxName?.trim()
    ? `Sandbox "${input.sandboxName.trim()}" is unavailable.`
    : 'The requested OpenShell sandbox is unavailable.';

  return {
    question: [
      sandbox,
      `Reason: ${input.reason.trim() || 'unknown'}`,
      '',
      'Continuing on the host changes the safety boundary.',
      '',
      'What should CleanClaw do?',
    ].join('\n'),
    defaultId: 'recover-sandbox',
    options: [
      {
        id: 'recover-sandbox',
        label: 'Recover sandbox',
        description: 'Try to start or reconnect the configured sandbox before continuing.',
        recommended: true,
      },
      {
        id: 'continue-host',
        label: 'Continue on host',
        description: 'Use software root guard only for this session.',
      },
      {
        id: 'runtime-settings',
        label: 'Runtime settings',
        description: 'Change sandbox/runtime settings before continuing.',
      },
      {
        id: 'stop',
        label: 'Stop',
        description: 'Stop before execution.',
      },
    ],
  };
}
