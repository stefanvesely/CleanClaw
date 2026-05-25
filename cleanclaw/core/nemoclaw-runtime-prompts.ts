import type { NumberedPromptConfig } from './numbered-prompt.js';

export type NemoClawRuntimePromptKind =
  | 'setup-missing'
  | 'setup-stopped'
  | 'startup-stopped'
  | 'auto-start-preference';

export interface NemoClawRuntimePromptInput {
  kind: NemoClawRuntimePromptKind;
  projectName?: string;
}

export function createNemoClawRuntimePrompt(
  input: NemoClawRuntimePromptInput,
): NumberedPromptConfig {
  switch (input.kind) {
    case 'setup-missing':
      return setupMissingPrompt();
    case 'setup-stopped':
      return setupStoppedPrompt();
    case 'startup-stopped':
      return startupStoppedPrompt(input.projectName);
    case 'auto-start-preference':
      return autoStartPreferencePrompt();
  }
}

function setupMissingPrompt(): NumberedPromptConfig {
  return {
    question: [
      'NemoClaw/OpenShell is not available.',
      '',
      'CleanClaw can still run in standalone mode, but sandbox/runtime protection will be reduced.',
      '',
      'What should CleanClaw do?',
    ].join('\n'),
    defaultId: 'install-configure',
    options: [
      {
        id: 'install-configure',
        label: 'Install/configure NemoClaw',
        description: 'Get help setting up NemoClaw/OpenShell before continuing.',
        recommended: true,
      },
      {
        id: 'continue-standalone',
        label: 'Continue standalone',
        description: 'Use software guardrails without NemoClaw/OpenShell runtime protection.',
      },
      {
        id: 'stop-setup',
        label: 'Stop setup',
        description: 'Stop now and make no runtime changes.',
      },
    ],
  };
}

function setupStoppedPrompt(): NumberedPromptConfig {
  return {
    question: [
      'NemoClaw/OpenShell is installed but not running.',
      '',
      'What should CleanClaw do?',
    ].join('\n'),
    defaultId: 'start-nemoclaw',
    options: [
      {
        id: 'start-nemoclaw',
        label: 'Start NemoClaw',
        description: 'Ask before starting NemoClaw/OpenShell for this setup.',
        recommended: true,
      },
      {
        id: 'continue-standalone',
        label: 'Continue standalone',
        description: 'Continue setup without starting NemoClaw/OpenShell.',
      },
      {
        id: 'stop',
        label: 'Stop',
        description: 'Stop setup and make no runtime changes.',
      },
    ],
  };
}

function startupStoppedPrompt(projectName?: string): NumberedPromptConfig {
  const projectText = projectName?.trim()
    ? `NemoClaw is configured for ${projectName.trim()} but is not running.`
    : 'NemoClaw is configured for this project but is not running.';

  return {
    question: [
      projectText,
      '',
      'CleanClaw should not silently degrade runtime protection.',
      '',
      'What should CleanClaw do?',
    ].join('\n'),
    defaultId: 'start-nemoclaw',
    options: [
      {
        id: 'start-nemoclaw',
        label: 'Start NemoClaw',
        description: 'Ask before starting the configured NemoClaw/OpenShell runtime.',
        recommended: true,
      },
      {
        id: 'continue-standalone',
        label: 'Continue standalone',
        description: 'Use standalone mode for this session only.',
      },
      {
        id: 'runtime-settings',
        label: 'Runtime settings',
        description: 'Change the project runtime preference before continuing.',
      },
      {
        id: 'stop',
        label: 'Stop',
        description: 'Stop before execution.',
      },
    ],
  };
}

function autoStartPreferencePrompt(): NumberedPromptConfig {
  return {
    question: 'When I run cleanclaw, should CleanClaw start NemoClaw if needed?',
    defaultId: 'ask-every-time',
    options: [
      {
        id: 'ask-every-time',
        label: 'Ask every time',
        description: 'CleanClaw will ask before starting NemoClaw/OpenShell.',
        recommended: true,
      },
      {
        id: 'start-automatically',
        label: 'Start automatically',
        description: 'Start NemoClaw/OpenShell automatically for this project.',
      },
      {
        id: 'never-start',
        label: 'Never start',
        description: 'Do not start NemoClaw/OpenShell automatically.',
      },
    ],
  };
}
