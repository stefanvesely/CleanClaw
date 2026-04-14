import type { Bridge } from '../bridges/anthropic-bridge.js';

export interface WizardSuggestions {
  why: string;
  files: string;
  criteria: string;
  outOfScope: string;
}

const SYSTEM_PROMPT = `You are a setup assistant for CleanClaw, an AI-assisted development tool. Given a task description, suggest concise answers for four workflow questions. Respond with a JSON object only — no markdown, no explanation:

{
  "why": "one sentence explaining why this task matters",
  "files": "comma-separated list of files likely affected",
  "criteria": "one sentence describing what done looks like",
  "outOfScope": "one sentence naming what should not change"
}`;

export async function suggestWorkflowAnswers(
  taskDescription: string,
  bridge: Bridge,
): Promise<WizardSuggestions | null> {
  try {
    const response = await bridge.send(
      [{ role: 'user', content: `Task: ${taskDescription}` }],
      SYSTEM_PROMPT,
    );
    return JSON.parse(response.content) as WizardSuggestions;
  } catch {
    // Delegation failure → return null so caller falls back to manual flow
    return null;
  }
}

export function isOpenshellAvailable(): boolean {
  // Openshell availability check — Phase 8 (sandbox execution) is deferred.
  // Until sandbox integration is complete, delegation runs without openshell.
  return true;
}
