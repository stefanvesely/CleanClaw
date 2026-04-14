import type { Bridge } from '../bridges/anthropic-bridge.js';
import type { ChangeCategory, ScopeAction } from './scope-rules.js';
import { CATEGORY_ACTIONS } from './scope-rules.js';

export interface ClassifierInput {
  filename: string;
  diff: string;
  precheckRationale: string;
  taskDescription: string;
  planContent: string;
}

export interface ClassifierResult {
  category: ChangeCategory;
  action: ScopeAction;
}

const SYSTEM_PROMPT = `You are a scope classifier for an AI-assisted development tool. Your job is to categorise a proposed code change into exactly one of these categories:

- structural: class, property, method signature — no new logic
- behavioural: new conditions, loops, data flow, business logic
- ui-addition: new component, button, route, visual element
- new-dependency: new import statement or package reference
- cross-cutting: affects concerns outside the stated task scope
- unmapped: cannot be confidently assigned to any category

Respond with a single JSON object: { "category": "<category>" }
No explanation. No markdown. Only the JSON object.`;

export async function classify(input: ClassifierInput, bridge: Bridge): Promise<ClassifierResult> {
  try {
    const prompt = `Pre-check analysis: ${input.precheckRationale}

Task: ${input.taskDescription}

File: ${input.filename}

Diff:
${input.diff}`;

    const response = await bridge.send(
      [{ role: 'user', content: prompt }],
      SYSTEM_PROMPT,
    );

    const parsed = JSON.parse(response.content) as { category: ChangeCategory };
    const category = parsed.category;

    if (!(category in CATEGORY_ACTIONS)) {
      return { category: 'unmapped', action: 'halt-confirm' };
    }

    return { category, action: CATEGORY_ACTIONS[category] };
  } catch {
    // Classifier failure → always unmapped → halt-confirm. Never throws, never silently proceeds.
    return { category: 'unmapped', action: 'halt-confirm' };
  }
}
