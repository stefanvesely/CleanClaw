import fs from 'fs';
import path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanStep {
  number: string;
  heading: string;
  body: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validatePlanFormat(markdown: string): void {
  const required = ['## Objective', '## Steps', '## Scope Boundary'];

  for (const heading of required) {
    if (!markdown.includes(heading)) {
      throw new Error(`Plan is missing required section: ${heading}`);
    }
  }

  // Each step line must reference at least one file (contains a dot suggesting a filename)
  const stepsSection = markdown.split('## Scope Boundary')[0].split('## Steps')[1] ?? '';
  const stepLines = stepsSection.split('\n').filter(l => /^\d+\./.test(l.trim()));

  if (stepLines.length === 0) {
    throw new Error('Plan has no steps in ## Steps section');
  }

  for (const line of stepLines) {
    if (!line.includes('.')) {
      throw new Error(
        `Step does not reference a specific file: "${line.trim()}"\n` +
        `Each step must name the file(s) it changes (e.g. "Update UserService.cs — add validation")`
      );
    }
  }
}

// ─── Task Plan Step Parser (numbered list format from planning-agent) ─────────

export interface TaskStep {
  number: string;
  body: string;
}

export function parseTaskPlanSteps(planMarkdown: string): TaskStep[] {
  const stepsSection = planMarkdown.split('## Scope Boundary')[0].split('## Steps')[1] ?? '';
  const lines = stepsSection.split('\n').filter(l => /^\d+\./.test(l.trim()));

  return lines.map(line => {
    const match = line.match(/^(\d+)\.\s+(.+)$/);
    return {
      number: match?.[1] ?? '?',
      body: match?.[2]?.trim() ?? line.trim(),
    };
  });
}

// ─── Build Plan Parser (### Step N.Na — format for CleanClaw's own plan) ──────

export function parsePlanSteps(planMarkdown: string): PlanStep[] {
  const STEP_HEADING = /^### (Step (\d+\.\d+[a-z]?) — .+)$/m;
  const lines = planMarkdown.split('\n');
  const steps: PlanStep[] = [];

  let currentHeading: string | null = null;
  let currentNumber: string | null = null;
  let bodyLines: string[] = [];

  for (const line of lines) {
    const match = line.match(STEP_HEADING);
    if (match) {
      if (currentHeading !== null) {
        steps.push({ heading: currentHeading, number: currentNumber!, body: bodyLines.join('\n').trim() });
      }
      currentHeading = match[1];
      currentNumber = match[2];
      bodyLines = [];
    } else if (currentHeading !== null) {
      // Skip [DONE] prefixed headings — already completed
      if (/^### \[DONE\]/.test(line)) continue;
      bodyLines.push(line);
    }
  }

  if (currentHeading !== null) {
    steps.push({ heading: currentHeading, number: currentNumber!, body: bodyLines.join('\n').trim() });
  }

  return steps;
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function writePlan(taskId: string, variant: string, markdown: string, plansDir: string): string {
  validatePlanFormat(markdown);

  const dir = path.join(plansDir, `task${taskId}`);
  const filename = `task${taskId}${variant}_plan.md`;
  const filepath = path.join(dir, filename);

  if (fs.existsSync(filepath)) {
    throw new Error(
      `Plan file already exists: ${filepath}\n` +
      `To revise the plan, create a new variant (e.g. task${taskId}B_plan.md) — never overwrite.`
    );
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, markdown, 'utf-8');

  return filepath;
}

// ─── Completion Tracking ──────────────────────────────────────────────────────

export function markStepComplete(planPath: string, stepHeading: string, outputPath: string): void {
  let content: string;

  if (fs.existsSync(outputPath)) {
    content = fs.readFileSync(outputPath, 'utf-8');
  } else {
    content = fs.readFileSync(planPath, 'utf-8');
  }

  const updated = content.replace(
    `### ${stepHeading}`,
    `### [DONE] ${stepHeading}`
  );

  if (updated === content) {
    process.stderr.write(`[CleanClaw] Warning: step heading not found in plan, skipping completion mark: "${stepHeading.slice(0, 60)}..."\n`);
    return;
  }

  fs.writeFileSync(outputPath, updated, 'utf-8');
}
