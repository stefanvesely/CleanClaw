import fs from 'fs';
import path from 'path';
import { getConfig } from '../../cleanclaw/core/config-loader.js';
import { runPipeline } from '../../cleanclaw/core/pipeline.js';

const config = getConfig();

// Clean up previous test run
const testPlanDir = path.resolve(config.plansDir, 'task01');
if (fs.existsSync(testPlanDir)) {
  fs.rmSync(testPlanDir, { recursive: true });
  console.log('Cleaned up previous test plan.\n');
}

// Clean up any files written by a previous run
const testOutputDir = path.resolve('test/smoke/temp-project');
if (fs.existsSync(testOutputDir)) {
  fs.rmSync(testOutputDir, { recursive: true });
  console.log('Cleaned up previous test output files.\n');
}

console.log('Weekend 5 smoke test — multi-provider config + approval granularity...\n');
console.log(`Provider: ${config.provider}`);
console.log(`Approval granularity: ${config.approvalGranularity}`);
console.log('You will be prompted to approve or reject each proposed change.\n');

await runPipeline(
  'Add a TypeScript utility function that formats a date as YYYY-MM-DD and returns a string',
  config
);

// Verify log exists and has correct structure
const logFile = path.resolve(config.plansDir, 'task01', 'task01A_log.md');
if (!fs.existsSync(logFile)) throw new Error('FAIL: log file not found');
const log = fs.readFileSync(logFile, 'utf-8');
if (!log.includes('**Why:**')) throw new Error('FAIL: log missing Why field');
if (!log.includes('[agent]') && !log.includes('[user]')) throw new Error('FAIL: log missing WHY prefix');

console.log('\nWeekend 5 milestone: PASS');
console.log(`Provider used: ${config.provider}`);
console.log('Log has correct structure with [agent]/[user] WHY prefix.');
