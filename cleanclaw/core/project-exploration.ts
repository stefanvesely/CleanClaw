import type { ProjectHealth } from './project-health.js';

export type ProjectExplorationSource = 'projectmap' | 'approved-scan-or-manual-context';

export interface ProjectExplorationDecision {
  source: ProjectExplorationSource;
  reason: string;
}

export function chooseProjectExplorationSource(
  projectMap: ProjectHealth['projectMap'],
): ProjectExplorationDecision {
  if (projectMap.status === 'ready') {
    return {
      source: 'projectmap',
      reason: `ProjectMap is ready with ${projectMap.vectorTableCount} vector table${projectMap.vectorTableCount === 1 ? '' : 's'}.`,
    };
  }

  return {
    source: 'approved-scan-or-manual-context',
    reason: `ProjectMap is ${projectMap.status}; use approved scan or manual context instead.`,
  };
}

export function formatProjectExplorationDecision(decision: ProjectExplorationDecision): string {
  return [
    `Project exploration source: ${decision.source}`,
    `Reason: ${decision.reason}`,
  ].join('\n');
}
