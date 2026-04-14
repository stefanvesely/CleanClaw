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

export async function isOpenshellAvailable(): Promise<boolean> {
  try {
    // Computed path prevents TypeScript from statically tracing into src/ (CJS boundary)
    const resolveOpenshellPath = ['../../src/lib', 'resolve-openshell.js'].join('/');
    const { resolveOpenshell } = await import(resolveOpenshellPath) as { resolveOpenshell: () => Promise<string | null> };
    const result = await resolveOpenshell();
    return result !== null;
  } catch {
    // DEGRADED MODE: no sandbox — filesystem boundary is software-enforced only
    return false;
  }
}
