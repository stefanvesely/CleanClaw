import OpenAI, { APIError } from 'openai';
import type { Bridge, BridgeMessage, BridgeResponse } from './anthropic-bridge.js';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export class NvidiaBridge implements Bridge {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string, baseUrl?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl ?? NVIDIA_BASE_URL,
    });
    this.model = model;
  }

  async send(messages: BridgeMessage[], systemPrompt?: string): Promise<BridgeResponse> {
    let response;
    try {
      response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 4096,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ],
      });
    } catch (err) {
      if (err instanceof APIError) {
        if (err.status === 401) throw new Error('NVIDIA NIM authentication failed. Check your NVIDIA_API_KEY.');
        if (err.status === 429) throw new Error('NVIDIA NIM rate limit hit. Wait a moment and try again.');
        throw new Error(`NVIDIA NIM API error: ${err.status} ${err.message}`);
      }
      throw err;
    }

    const content = response.choices[0]?.message?.content ?? '';

    return {
      content,
      model: response.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }
}
