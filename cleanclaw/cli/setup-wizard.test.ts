import { describe, expect, it } from 'vitest';
import {
  credentialSetupPrompt,
  defaultSetupCredentialValue,
  resolveSetupCredentialValue,
} from './setup-wizard.js';

describe('setup wizard credential prompts', () => {
  it('uses local provider token defaults so Ollama and vLLM work after setup', () => {
    expect(defaultSetupCredentialValue('ollama-local')).toBe('ollama');
    expect(defaultSetupCredentialValue('vllm-local')).toBe('vllm-local');
    expect(resolveSetupCredentialValue('', 'ollama-local')).toBe('ollama');
    expect(resolveSetupCredentialValue('', 'vllm-local')).toBe('vllm-local');
  });

  it('keeps remote credentials optional when users prefer environment variables', () => {
    expect(defaultSetupCredentialValue('openai-api')).toBeNull();
    expect(resolveSetupCredentialValue('', 'openai-api')).toBeNull();
    expect(resolveSetupCredentialValue('sk-test', 'openai-api')).toBe('sk-test');
    expect(credentialSetupPrompt('openai-api')).toContain('OPENAI_API_KEY');
  });
});
