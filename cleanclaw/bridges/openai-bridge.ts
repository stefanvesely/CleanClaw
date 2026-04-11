import OpenAI, { APIError } from 'openai';
import type { Bridge, BridgeMessage, BridgeResponse } from './anthropic-bridge.js';

export class OpenAiBridge implements Bridge {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey });
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
        if (err.status === 401) throw new Error('OpenAI authentication failed. Check your OPENAI_API_KEY.');
        if (err.status === 429) throw new Error('OpenAI rate limit hit. Wait a moment and try again.');
        throw new Error(`OpenAI API error: ${err.status} ${err.message}`);
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
