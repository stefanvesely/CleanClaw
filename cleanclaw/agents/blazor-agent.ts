import type { Bridge } from '../bridges/anthropic-bridge.js';
import type { LanguageAgent, ProposedChange } from '../core/language-agent.js';

function extractJson(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

const SYSTEM_PROMPT = `You are a senior Blazor developer working inside CleanClaw — an audit trail and human approval layer for AI-assisted development.

Given a task step description, propose exactly one code change in this JSON format:

{
  "filename": "relative/path/to/Component.razor",
  "beforeLines": [
    { "lineNumber": 8, "content": "existing line content" }
  ],
  "afterLines": [
    { "lineNumber": 8, "content": "new line content" }
  ],
  "explanation": "Why this change is being made — one or two sentences."
}

Blazor coding standards to follow:
- Use @rendermode InteractiveServer for interactive components
- Prefer EventCallback over Action for component events
- Use IJSRuntime for JavaScript interop
- Use nullable reference types (string? for optional values)
- One logical change per proposal — never bundle multiple concerns

Respond with ONLY the JSON object. No markdown code fences, no preamble, no explanation outside the JSON.`;

export class BlazorAgent implements LanguageAgent {
  stack = 'blazor';

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
        throw new Error(`BlazorAgent failed after retry.\n${(secondError as Error).message}`);
      }
    }
  }
}
