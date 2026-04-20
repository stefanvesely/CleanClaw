import { pipeline } from '@xenova/transformers';

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

export class LocalEmbedder {
  private pipeline: any;

  async init(): Promise<void> {
    if (this.pipeline) return;
    this.pipeline = await pipeline('feature-extraction', MODEL_ID);
  }

  async embed(texts: string[]): Promise<number[][]> {
    await this.init();
    const results: number[][] = [];
    for (const text of texts) {
      const output = await this.pipeline(text, { pooling: 'mean', normalize: true });
      results.push(Array.from(output.data) as number[]);
    }
    return results;
  }
}
