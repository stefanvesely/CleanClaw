import OpenAI from 'openai';
import type { Bridge, BridgeMessage, BridgeResponse } from './anthropic-bridge.js';

export class OpenAiBridge implements Bridge {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async send(messages: BridgeMessage[], systemPrompt?: string): Promise<BridgeResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 4096,
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
    });

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
