export interface TaskWhyIntake {
  text: string;
  approved: boolean;
  approvedByUserText: string;
}

export function draftTaskWhy(taskDescription: string, projectName: string): string {
  const normalizedTask = normalizeTaskWhyText(taskDescription);
  const normalizedProject = normalizeTaskWhyText(projectName);

  if (!normalizedTask) {
    return '';
  }

  if (!normalizedProject) {
    return `So the requested task can be planned and validated against a clear user-approved purpose: ${normalizedTask}.`;
  }

  return `So ${normalizedProject} can safely complete this requested work with a clear purpose: ${normalizedTask}.`;
}

export function createApprovedTaskWhy(text: string, approvedByUserText: string): TaskWhyIntake | null {
  const normalizedText = normalizeTaskWhyText(text);
  const normalizedApproval = normalizeTaskWhyText(approvedByUserText);
  if (!normalizedText) return null;

  return {
    text: normalizedText,
    approved: true,
    approvedByUserText: normalizedApproval || normalizedText,
  };
}

export function normalizeTaskWhyText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
