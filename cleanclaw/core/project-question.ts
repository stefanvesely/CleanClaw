export interface ProjectQuestionClassification {
  isProjectQuestion: boolean;
  reason: string;
}

const QUESTION_STARTERS = [
  'what',
  'where',
  'which',
  'who',
  'how',
  'why',
  'can you explain',
  'tell me',
  'show me',
];

const PROJECT_TERMS = [
  'project',
  'code',
  'repo',
  'repository',
  'architecture',
  'stack',
  'file',
  'folder',
  'plan',
  'changelog',
  'workflow',
  'setting',
  'config',
];

export function classifyProjectQuestion(input: string): ProjectQuestionClassification {
  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return { isProjectQuestion: false, reason: 'No input was provided.' };
  }

  const asksQuestion = normalized.endsWith('?')
    || QUESTION_STARTERS.some((starter) => normalized.startsWith(starter));
  const mentionsProject = PROJECT_TERMS.some((term) => normalized.includes(term));

  if (asksQuestion && mentionsProject) {
    return {
      isProjectQuestion: true,
      reason: 'Input asks about project context and does not request a change.',
    };
  }

  return {
    isProjectQuestion: false,
    reason: 'Input looks like task work or lacks project-question signals.',
  };
}

export function formatProjectQuestionResponse(question: string): string {
  return [
    'Read-only project question mode.',
    `Question: ${question.trim()}`,
    'No files will be changed and no execution plan will be created for this question.',
  ].join('\n');
}
