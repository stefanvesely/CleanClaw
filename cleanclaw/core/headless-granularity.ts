export interface HeadlessGranularStep {
  id: string;
  task: string;
  why: string;
  plannedFiles: string[];
  validation: string[];
  stopCondition: string;
}

export interface HeadlessGranularityResult {
  granular: boolean;
  issues: string[];
}

export function checkHeadlessPlanGranularity(steps: HeadlessGranularStep[]): HeadlessGranularityResult {
  const issues: string[] = [];

  if (steps.length === 0) {
    issues.push('Headless plan needs at least one granular step.');
  }

  for (const step of steps) {
    const label = step.id.trim() || 'unnamed step';
    if (!step.task.trim()) issues.push(`${label}: missing single task.`);
    if (!step.why.trim()) issues.push(`${label}: missing step why.`);
    if (step.plannedFiles.length === 0) issues.push(`${label}: missing planned files.`);
    if (step.validation.length === 0) issues.push(`${label}: missing validation.`);
    if (!step.stopCondition.trim()) issues.push(`${label}: missing stop condition.`);
    if (step.task.split(/\band\b|,/i).filter(part => part.trim()).length > 1) {
      issues.push(`${label}: task appears to contain multiple actions.`);
    }
  }

  return {
    granular: issues.length === 0,
    issues,
  };
}

export function formatHeadlessGranularityResult(result: HeadlessGranularityResult): string {
  if (result.granular) {
    return 'Headless plan is granular enough for bounded execution.';
  }

  return [
    'Headless plan is not granular enough.',
    ...result.issues.map(issue => `- ${issue}`),
  ].join('\n');
}
