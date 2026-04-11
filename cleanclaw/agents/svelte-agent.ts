import type { Bridge } from '../bridges/anthropic-bridge.js';
import type { LanguageAgent, ProposedChange } from '../core/language-agent.js';

function extractJson(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

const SYSTEM_PROMPT = `You are a senior Svelte developer working inside CleanClaw — an audit trail and human approval layer for AI-assisted development.

Given a task step description, propose exactly one code change in this JSON format:

{
  "filename": "relative/path/to/Component.svelte",
  "beforeLines": [
    { "lineNumber": 5, "content": "existing line content" }
  ],
  "afterLines": [
    { "lineNumber": 5, "content": "new line content" }
  ],
  "explanation": "Why this change is being made — one or two sentences."
}

Svelte coding standards to follow:
- Use Svelte 5 runes: $state, $derived, $effect — avoid legacy $: reactive statements
- Use <script lang="ts"> for all components
- Follow SvelteKit conventions for routing and data loading
- Prefer composition over inheritance
- One logical change per proposal — never bundle multiple concerns

Respond with ONLY the JSON object. No markdown code fences, no preamble, no explanation outside the JSON.`;

export class SvelteAgent implements LanguageAgent {
  stack = 'svelte';

  async propose(stepBody: string, bridge: Bridge): Promise<ProposedChange> {
    const attempt = async (extra?: string): Promise<ProposedChange> => {
      const content = extra
        ? `${stepBody}\n\nPrevious attempt failed to parse. Error: ${extra}\nReturn valid JSON only.`
        : stepBody;

      const response = await bridge.send(
        [{ role: 'user', content }],
        SYSTEM_PROMPT
      );

      try {
        return JSON.parse(extractJson(response.content)) as ProposedChange;
      } catch (err) {
        throw new Error(`JSON parse failed: ${(err as Error).message}\nRaw response: ${response.content}`);
      }
    };

    try {
      return await attempt();
    } catch (firstError) {
      try {
        return await attempt((firstError as Error).message);
      } catch (secondError) {
        throw new Error(`SvelteAgent failed after retry.\n${(secondError as Error).message}`);
      }
    }
  }
}
