import OpenAI from 'openai';
import type { CleanClawConfig } from '../config/config-schema.js';

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}

const LOCAL_MODEL = 'Xenova/all-MiniLM-L6-v2';

const OPENAI_COMPATIBLE = new Set(['openai', 'vllm-local', 'ollama-local']);

const DEFAULT_BASE_URLS: Record<string, string> = {
  'ollama-local': 'http://localhost:11434/v1',
  'vllm-local': 'http://localhost:8000/v1',
};

const DEFAULT_MODELS: Record<string, string> = {
  openai: 'text-embedding-3-small',
  'ollama-local': 'nomic-embed-text',
  'vllm-local': 'nomic-embed-text',
};

export class OpenAICompatibleEmbeddingProvider implements EmbeddingProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string, baseURL?: string) {
    this.client = new OpenAI({ apiKey: apiKey || 'local', baseURL });
    this.model = model;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({ input: texts, model: this.model });
    return response.data.map((item) => item.embedding);
  }
}

export class HttpEmbeddingProvider implements EmbeddingProvider {
  private baseUrl: string;
  private model: string;
  private apiKey: string;

  constructor(baseUrl: string, model: string, apiKey = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.apiKey = apiKey;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ input: texts, model: this.model }),
    });

    const data = await response.json() as { data: { embedding: number[] }[] };
    return data.data.map((item) => item.embedding);
  }
}

export class LocalEmbeddingProvider implements EmbeddingProvider {
  private modelName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pipe: any = null;

  constructor(modelName: string = LOCAL_MODEL) {
    this.modelName = modelName;
  }

  private async getPipeline() {
    if (!this.pipe) {
      const { pipeline } = await import('@xenova/transformers');
      this.pipe = await pipeline('feature-extraction', this.modelName);
    }
    return this.pipe;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const pipe = await this.getPipeline();
    const results: number[][] = [];
    for (const text of texts) {
      const output = await pipe(text, { pooling: 'mean', normalize: true });
      results.push(Array.from(output.data) as number[]);
    }
    return results;
  }
}

export async function getProvider(config: CleanClawConfig): Promise<EmbeddingProvider> {
  const emb = config.embeddings ?? {};
  const provider = emb.provider ?? 'openai';
  const model = emb.model ?? DEFAULT_MODELS[provider] ?? 'text-embedding-3-small';
  const apiKey = emb.apiKey ?? '';

  if (provider === 'local') {
    return new LocalEmbeddingProvider(model || LOCAL_MODEL);
  }

  if (OPENAI_COMPATIBLE.has(provider)) {
    const baseURL = emb.baseUrl ?? DEFAULT_BASE_URLS[provider];
    return new OpenAICompatibleEmbeddingProvider(apiKey, model, baseURL);
  }

  if (provider === 'http') {
    if (!emb.baseUrl) throw new Error("embeddings.baseUrl is required for provider 'http'");
    return new HttpEmbeddingProvider(emb.baseUrl, model, apiKey);
  }

  throw new Error(
    `Unknown embedding provider: ${JSON.stringify(provider)}. Supported: http, local, ollama-local, openai, vllm-local`
  );
}
