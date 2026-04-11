import fs from 'fs';
import path from 'path';

export interface CleanClawState {
  projectName: string;
  currentTaskId: string;
  currentVariant: string;
  plansDir: string;
  lastUpdated: string;
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
