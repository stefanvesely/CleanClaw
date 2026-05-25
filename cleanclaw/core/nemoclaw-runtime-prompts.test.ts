import { describe, expect, it } from 'vitest';
import { formatNumberedPrompt } from './numbered-prompt.js';
import { createNemoClawRuntimePrompt } from './nemoclaw-runtime-prompts.js';

describe('NemoClaw runtime prompts', () => {
  it('offers install/configure, standalone, or stop when setup cannot find NemoClaw', () => {
    const prompt = createNemoClawRuntimePrompt({ kind: 'setup-missing' });

    expect(prompt.defaultId).toBe('install-configure');
    expect(prompt.options.map(option => option.id)).toEqual([
      'install-configure',
      'continue-standalone',
      'stop-setup',
    ]);
    expect(formatNumberedPrompt(prompt)).toContain('NemoClaw/OpenShell is not available.');
  });

  it('offers start, standalone, or stop when setup finds stopped NemoClaw', () => {
    const prompt = createNemoClawRuntimePrompt({ kind: 'setup-stopped' });

    expect(prompt.defaultId).toBe('start-nemoclaw');
    expect(prompt.options.map(option => option.id)).toEqual([
      'start-nemoclaw',
      'continue-standalone',
      'stop',
    ]);
  });

  it('offers start, standalone, settings, or stop at startup', () => {
    const prompt = createNemoClawRuntimePrompt({
      kind: 'startup-stopped',
      projectName: 'CleanClaw',
    });

    expect(prompt.options.map(option => option.id)).toEqual([
      'start-nemoclaw',
      'continue-standalone',
      'runtime-settings',
      'stop',
    ]);
    expect(formatNumberedPrompt(prompt)).toContain('configured for CleanClaw but is not running');
  });

  it('defaults auto-start preference to asking every time', () => {
    const prompt = createNemoClawRuntimePrompt({ kind: 'auto-start-preference' });

    expect(prompt.defaultId).toBe('ask-every-time');
    expect(prompt.options.map(option => option.id)).toEqual([
      'ask-every-time',
      'start-automatically',
      'never-start',
    ]);
    expect(prompt.options[0].recommended).toBe(true);
  });
});
