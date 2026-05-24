import type { HeadlessGranularStep } from './headless-granularity.js';

export interface HeadlessCoderTaskPackage {
  stepId: string;
  task: string;
  why: string;
  plannedFiles: string[];
  validation: string[];
  stopCondition: string;
}

export function createHeadlessCoderTaskPackage(
  steps: HeadlessGranularStep[],
  stepId: string,
): HeadlessCoderTaskPackage {
  const step = steps.find(candidate => candidate.id === stepId);
  if (!step) {
    throw new Error(`Headless coder task step not found: ${stepId}`);
  }

  return {
    stepId: step.id,
    task: step.task,
    why: step.why,
    plannedFiles: [...step.plannedFiles],
    validation: [...step.validation],
    stopCondition: step.stopCondition,
  };
}

export function formatHeadlessCoderTaskPackage(taskPackage: HeadlessCoderTaskPackage): string {
  return [
    `Step: ${taskPackage.stepId}`,
    `Task: ${taskPackage.task}`,
    `Why: ${taskPackage.why}`,
    'Files:',
    ...taskPackage.plannedFiles.map(file => `- ${file}`),
    'Validation:',
    ...taskPackage.validation.map(command => `- ${command}`),
    `Stop condition: ${taskPackage.stopCondition}`,
  ].join('\n');
}
