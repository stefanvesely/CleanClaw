import Anthropic from '@anthropic-ai/sdk';

export interface BridgeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BridgeResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface Bridge {
  send(messages: BridgeMessage[], systemPrompt?: string): Promise<BridgeResponse>;
}

export class AnthropicBridge implements Bridge {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async send(messages: BridgeMessage[], systemPrompt?: string): Promise<BridgeResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      content,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
