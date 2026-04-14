import fs from 'fs';
import os from 'os';
import path from 'path';

export interface CleanClawState {
  projectName: string;
  currentTaskId: string;
  currentVariant: string;
  plansDir: string;
  lastUpdated: string;
  iterationCount: number;
}

export function saveState(state: CleanClawState, projectDir: string): void {
  const filepath = path.join(projectDir, '.cleanclaw-state.json');
  fs.writeFileSync(filepath, JSON.stringify(state, null, 2), 'utf-8');
}

export function loadState(projectDir: string): CleanClawState | null {
  const filepath = path.join(projectDir, '.cleanclaw-state.json');
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as CleanClawState;
}

export function getGlobalStateDir(): string {
  return path.join(os.homedir(), '.cleanclaw');
}

export function saveActiveProject(projectDir: string): void {
  const dir = getGlobalStateDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'active-project.json'), JSON.stringify({ projectDir }, null, 2), 'utf-8');
}

export function loadActiveProject(): string | null {
  const filepath = path.join(getGlobalStateDir(), 'active-project.json');
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')).projectDir as string;
}
