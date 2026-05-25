import { describe, expect, it } from 'vitest';
import { formatNumberedPrompt } from './numbered-prompt.js';
import { createSandboxFallbackPrompt } from './sandbox-fallback-prompt.js';

describe('sandbox fallback prompt', () => {
  it('asks before falling back to host execution', () => {
    const prompt = createSandboxFallbackPrompt({
      sandboxName: 'demo',
      reason: 'OpenShell is not reachable.',
    });

    expect(prompt.defaultId).toBe('recover-sandbox');
    expect(prompt.options.map(option => option.id)).toEqual([
      'recover-sandbox',
      'continue-host',
      'runtime-settings',
      'stop',
    ]);
    expect(prompt.options[0].recommended).toBe(true);
  });

  it('formats the sandbox name and safety boundary warning', () => {
    const output = formatNumberedPrompt(createSandboxFallbackPrompt({
      sandboxName: 'demo',
      reason: 'Sandbox process exited.',
    }));

    expect(output).toContain('Sandbox "demo" is unavailable.');
    expect(output).toContain('Reason: Sandbox process exited.');
    expect(output).toContain('Continuing on the host changes the safety boundary.');
  });

  it('falls back to generic sandbox wording when no name exists', () => {
    const output = formatNumberedPrompt(createSandboxFallbackPrompt({
      sandboxName: null,
      reason: '',
    }));

    expect(output).toContain('The requested OpenShell sandbox is unavailable.');
    expect(output).toContain('Reason: unknown');
  });
});
