import { describe, expect, it } from 'vitest';
import {
  createLocalChatProviderConfig,
  createLocalChatRequest,
} from './local-chat-provider.js';

describe('local chat provider', () => {
  it('creates an OpenAI-compatible local chat config for Ollama', () => {
    expect(createLocalChatProviderConfig({
      provider: 'ollama-local',
    })).toEqual({
      provider: 'ollama-local',
      model: 'nemotron-3-nano:30b',
      baseUrl: 'http://localhost:11434/v1',
      endpoint: 'http://localhost:11434/v1/chat/completions',
      protocol: 'openai-chat-completions',
      purpose: 'local-chat-coding',
    });
  });

  it('allows an explicit local model and trims base URL slashes', () => {
    expect(createLocalChatProviderConfig({
      provider: 'vllm-local',
      model: 'local-coder',
      baseUrl: 'http://127.0.0.1:8000/v1/',
    })).toMatchObject({
      provider: 'vllm-local',
      model: 'local-coder',
      baseUrl: 'http://127.0.0.1:8000/v1',
      endpoint: 'http://127.0.0.1:8000/v1/chat/completions',
    });
  });

  it('rejects non-local providers for local chat coding', () => {
    expect(() => createLocalChatProviderConfig({
      provider: 'openai-api',
    })).toThrow(/Local chat provider must be one of/);
  });

  it('creates a deterministic local chat request shape', () => {
    const config = createLocalChatProviderConfig({ provider: 'ollama-local' });

    expect(createLocalChatRequest(config, [
      { role: 'system', content: 'You are CleanClaw local coder.' },
      { role: 'user', content: 'Summarize this file.' },
    ])).toEqual({
      model: 'nemotron-3-nano:30b',
      messages: [
        { role: 'system', content: 'You are CleanClaw local coder.' },
        { role: 'user', content: 'Summarize this file.' },
      ],
      temperature: 0.2,
      stream: false,
    });
  });
});
