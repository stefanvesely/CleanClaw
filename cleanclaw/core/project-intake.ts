import fs from 'fs';
import path from 'path';
import { detectProjectMarkers, formatProjectMarkers, type DetectedProjectMarker } from './project-markers.js';
import { loadProjectSettings } from './project-settings.js';
import type { ActiveProjectResolution } from './project-resolver.js';

export interface ProjectIntakeCandidate {
  projectRoot: string;
  projectName: string;
  source: ActiveProjectResolution['source'] | 'user-directory';
  markers: DetectedProjectMarker[];
}

export function buildProjectIntakeCandidate(resolution: ActiveProjectResolution): ProjectIntakeCandidate | null {
  if (!resolution.projectRoot) return null;
  return createProjectIntakeCandidate(resolution.projectRoot, resolution.source);
}

export function createProjectIntakeCandidate(
  projectRoot: string,
  source: ProjectIntakeCandidate['source'],
): ProjectIntakeCandidate {
  const resolvedRoot = path.resolve(projectRoot);
  const settings = loadProjectSettings(resolvedRoot);

  return {
    projectRoot: resolvedRoot,
    projectName: settings?.projectName ?? path.basename(resolvedRoot),
    source,
    markers: detectProjectMarkers(resolvedRoot),
  };
}

export function resolveUserProjectDirectory(input: string, cwd?: string): ProjectIntakeCandidate | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const resolvedRoot = path.resolve(cwd ?? process.cwd(), trimmed);
  if (!fs.existsSync(resolvedRoot) || !fs.statSync(resolvedRoot).isDirectory()) {
    return null;
  }

  return createProjectIntakeCandidate(resolvedRoot, 'user-directory');
}

export function formatProjectIntakeCandidate(candidate: ProjectIntakeCandidate, taskDescription: string): string {
  const markerLines = formatProjectMarkers(candidate.markers).map(marker => `- ${marker}`);
  return [
    `I think this work may belong in ${candidate.projectName}.`,
    `Why: the task is "${taskDescription.trim()}", and this candidate project is available from ${candidate.source}.`,
    `Root directory: ${candidate.projectRoot}`,
    'Project signals:',
    ...markerLines,
  ].join('\n');
}
