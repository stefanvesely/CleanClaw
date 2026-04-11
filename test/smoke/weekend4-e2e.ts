import fs from 'fs';
import path from 'path';
import { getConfig } from '../../cleanclaw/core/config-loader.js';
import { runPipeline } from '../../cleanclaw/core/pipeline.js';

// Set up a real temp project file for the agent to modify
const tempDir = path.resolve('test/smoke/temp-project');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}
fs.mkdirSync(tempDir, { recursive: true });

fs.writeFileSync(
  path.join(tempDir, 'utils.ts'),
  `export function processAge(age: number): string {\n  return \`Age is \${age}\`;\n}\n`,
  'utf-8'
);

// Clean up previous plan
const config = getConfig();
const testPlanDir = path.resolve(config.plansDir, 'task01');
if (fs.existsSync(testPlanDir)) {
  fs.rmSync(testPlanDir, { recursive: true });
  console.log('Cleaned up previous test plan.\n');
}

console.log('Weekend 4 E2E smoke test — real file on disk...\n');
console.log('You will be prompted to approve or reject each proposed change.\n');

await runPipeline(
  'Add input validation to the processAge function in test/smoke/temp-project/utils.ts — reject negative ages and ages over 150',
  config
);

// Verify artefacts
const planFile = path.resolve(config.plansDir, 'task01', 'task01A_plan.md');
const logFile = path.resolve(config.plansDir, 'task01', 'task01A_log.md');

if (!fs.existsSync(planFile)) throw new Error('FAIL: plan file not found');
if (!fs.existsSync(logFile)) throw new Error('FAIL: log file not found');

const log = fs.readFileSync(logFile, 'utf-8');
if (!log.includes('BEFORE:') || !log.includes('AFTER:')) throw new Error('FAIL: log missing BEFORE/AFTER');

console.log('\nWeekend 4 E2E milestone: PASS');
console.log('Plan:', planFile);
console.log('Log:', logFile);
