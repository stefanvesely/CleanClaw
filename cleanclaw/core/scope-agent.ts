import type { Bridge } from '../bridges/anthropic-bridge.js';

export interface ScopeAssessment {
  inScope: boolean;
  rationale: string;
}

export class ScopeAgent {
  constructor(private bridge: Bridge) {}

  async assess(changeDescription: string): Promise<ScopeAssessment> {
    // Stub — full LLM classification wired in Phase 5
    void this.bridge;
    void changeDescription;
    return { inScope: true, rationale: 'stub: scope assessment not yet implemented' };
  }
}
