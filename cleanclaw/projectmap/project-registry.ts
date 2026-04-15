import fs from 'fs';
import path from 'path';

export interface ProjectEntry {
  name: string;
  path: string;
  addedAt: string;
}

export function getRegistryPath(projectRoot: string): string {
  return path.join(projectRoot, '.cleanclaw', 'projectmap', 'registry.json');
}

export function readRegistry(projectRoot: string): ProjectEntry[] {
  const file = getRegistryPath(projectRoot);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as ProjectEntry[];
}

export function appendToRegistry(projectRoot: string, name: string, projectPath: string): void {
  const file = getRegistryPath(projectRoot);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const entries = readRegistry(projectRoot);
  if (entries.some(e => e.path === projectPath)) return;
  entries.push({ name, path: projectPath, addedAt: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(entries, null, 2), 'utf-8');
}
