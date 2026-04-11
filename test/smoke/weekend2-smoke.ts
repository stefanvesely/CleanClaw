import fs from 'fs';
import path from 'path';
import { getConfig } from '../../cleanclaw/core/config-loader.js';
import { runPipeline } from '../../cleanclaw/core/pipeline.js';

const config = getConfig();

// Clean up previous test run so smoke test always starts fresh
const testPlanDir = path.resolve(config.plansDir, 'task01');
if (fs.existsSync(testPlanDir)) {
  fs.rmSync(testPlanDir, { recursive: true });
  console.log('Cleaned up previous test plan.\n');
}

console.log('Weekend 2 smoke test — running pipeline...\n');

await runPipeline(
  'Add a TypeScript function that validates an email address and returns a boolean',
  config
);

console.log('\nWeekend 2 milestone: PASS');
console.log('Check ./plans/task01/task01A_plan.md for the generated plan.');
