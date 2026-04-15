import { readRegistry } from './project-registry.js';

export function listProjects(projectRoot: string): void {
  const entries = readRegistry(projectRoot);
  if (entries.length === 0) {
    console.log('No projects registered yet.');
    return;
  }
  for (const entry of entries) {
    console.log(`${entry.name} — ${entry.path} (added: ${entry.addedAt})`);
  }
}
