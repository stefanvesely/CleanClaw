import type { Bridge } from '../bridges/anthropic-bridge.js';

export interface ProposedChange {
  filename: string;
  beforeLines: { lineNumber: number; content: string }[];
  afterLines: { lineNumber: number; content: string }[];
  explanation: string;
}

export interface LanguageAgent {
  stack: string;
  propose(stepBody: string, bridge: Bridge): Promise<ProposedChange>;
}

function extractJson(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

export class GenericAgent implements LanguageAgent {
  stack: string;
  private systemPrompt: string;

  constructor(stack: string, systemPrompt: string) {
    this.stack = stack;
    this.systemPrompt = systemPrompt;
  }

  async propose(stepBody: string, bridge: Bridge): Promise<ProposedChange> {
    const attempt = async (extra?: string): Promise<ProposedChange> => {
      const content = extra
        ? `${stepBody}\n\nPrevious attempt failed to parse. Error: ${extra}\nReturn valid JSON only.`
        : stepBody;
      const response = await bridge.send([{ role: 'user', content }], this.systemPrompt);
      try {
        return JSON.parse(extractJson(response.content)) as ProposedChange;
      } catch (err) {
        throw new Error(`JSON parse failed: ${(err as Error).message}\nRaw: ${response.content}`);
      }
    };

    try {
      return await attempt();
    } catch (firstError) {
      try {
        return await attempt((firstError as Error).message);
      } catch (secondError) {
        throw new Error(`GenericAgent(${this.stack}) failed after retry.\n${(secondError as Error).message}`);
      }
    }
  }
}
