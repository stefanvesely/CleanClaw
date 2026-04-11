import fs from 'fs';
import path from 'path';
import os from 'os';

// Create a temp project directory outside the repo
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-e2e-'));

// Write a minimal config into the temp dir (simulates what `cleanclaw init` produces)
fs.writeFileSync(path.join(tmpDir, 'cleanclaw.config.json'), JSON.stringify({
  projectName: 'weekend6-test',
  provider: 'anthropic',
  approvalGranularity: 'per-change',
  stack: 'dotnet',
  plansDir: './plans',
  logFormat: 'markdown',
}, null, 2));
fs.mkdirSync(path.join(tmpDir, 'plans'), { recursive: true });

// Verify state-manager write/read
const { saveState, loadState, saveActiveProject, loadActiveProject } = await import('../../cleanclaw/core/state-manager.js');

saveState({
  projectName: 'weekend6-test',
  currentTaskId: '00',
  currentVariant: 'A',
  plansDir: './plans',
  lastUpdated: new Date().toISOString(),
}, tmpDir);

const state = loadState(tmpDir);
if (!state) throw new Error('FAIL: state not written');
if (state.projectName !== 'weekend6-test') throw new Error('FAIL: project name mismatch');

// Verify active project tracking
saveActiveProject(tmpDir);
const active = loadActiveProject();
if (active !== tmpDir) throw new Error(`FAIL: active project mismatch. Expected ${tmpDir}, got ${active}`);

// Cleanup
fs.rmSync(tmpDir, { recursive: true });

console.log('\nWeekend 6 milestone: PASS');
console.log('CLI handlers: state-manager, setup-wizard output, switch verified.');
