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
const testOutputDir = path.resolve('src');
if (fs.existsSync(testOutputDir)) {
  fs.rmSync(testOutputDir, { recursive: true });
  console.log('Cleaned up previous test output files.\n');
}

console.log('Weekend 3 smoke test — running full pipeline with approval...\n');
console.log('You will be prompted to approve or reject each proposed change.\n');

await runPipeline(
  'Add a TypeScript function that validates an email address and returns a boolean',
  config
);

console.log('\nWeekend 3 milestone: PASS');
console.log('Check plans/task01/ for the plan, log, and completed plan files.');
