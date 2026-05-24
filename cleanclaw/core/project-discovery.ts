import fs from 'fs';
import path from 'path';
import { detectProjectMarkers, type DetectedProjectMarker } from './project-markers.js';

export interface ProjectDiscoveryApproval {
  approved: boolean;
  userText: string;
}

export interface ProjectDiscoveryCandidate {
  root: string;
  markers: DetectedProjectMarker[];
}

export interface ProjectDiscoveryOptions {
  searchRoot: string;
  approval: ProjectDiscoveryApproval;
  maxDepth?: number;
}

const SKIP_DIRS = new Set(['.git', '.cleanclaw', 'node_modules', 'dist', 'build', '.venv', 'venv']);

export function discoverProjectsWithApproval(options: ProjectDiscoveryOptions): ProjectDiscoveryCandidate[] {
  if (!options.approval.approved || options.approval.userText.trim().length === 0) {
    throw new Error('Project folder discovery requires explicit user approval.');
  }

  const searchRoot = path.resolve(options.searchRoot);
  const maxDepth = options.maxDepth ?? 2;
  const candidates: ProjectDiscoveryCandidate[] = [];

  for (const directory of listDirectories(searchRoot, maxDepth)) {
    const markers = detectProjectMarkers(directory);
    if (markers.length > 0) {
      candidates.push({ root: directory, markers });
    }
  }

  return candidates.sort((a, b) => a.root.localeCompare(b.root));
}

export function formatProjectDiscoveryCandidates(candidates: ProjectDiscoveryCandidate[]): string {
  if (candidates.length === 0) {
    return 'No project candidates found.';
  }

  return candidates.map((candidate, index) => [
    `${index + 1}. ${candidate.root}`,
    '   Evidence:',
    ...candidate.markers.map(marker => `   - ${marker.relativePath} (${marker.label})`),
  ].join('\n')).join('\n\n');
}

function listDirectories(root: string, maxDepth: number): string[] {
  const results: string[] = [];
  const queue: Array<{ directory: string; depth: number }> = [{ directory: root, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    results.push(current.directory);
    if (current.depth >= maxDepth) continue;

    for (const entry of safeReadDir(current.directory)) {
      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
      queue.push({ directory: path.join(current.directory, entry.name), depth: current.depth + 1 });
    }
  }

  return results;
}

function safeReadDir(directory: string): fs.Dirent[] {
  try {
    return fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return [];
  }
}
