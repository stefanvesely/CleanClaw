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
