import fs from 'fs';
import path from 'path';
import { getConfig } from './config-loader.js';
import { resolveBridge } from './agent-router.js';
import { PlanningAgent } from './planning-agent.js';
import { BossAgent } from './boss-agent.js';
import type { CleanClawConfig } from '../config/config-schema.js';

// ─── Task ID ──────────────────────────────────────────────────────────────────

function getNextTaskId(plansDir: string): string {
  if (!fs.existsSync(plansDir)) {
    return '01';
  }

  const entries = fs.readdirSync(plansDir, { withFileTypes: true });
  const taskDirs = entries.filter(e => e.isDirectory() && /^task\d+$/.test(e.name));

  return String(taskDirs.length + 1).padStart(2, '0');
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function runPipeline(taskDescription: string, config: CleanClawConfig): Promise<void> {
  const plansDir = path.resolve(config.plansDir);
  const bridge = resolveBridge(config);
  const planningAgent = new PlanningAgent(bridge);
  const boss = new BossAgent(planningAgent, plansDir);

  const taskId = getNextTaskId(plansDir);
  const variant = 'A';

  // Phase 1 — Boss runs: generates plan, writes to disk, parses steps
  const { planPath } = await boss.run(taskDescription, taskId, variant);

  console.log('\n─────────────────────────────────────────');
  console.log(`Plan written: ${planPath}`);
  console.log('Review the plan above. Language agent execution begins in Weekend 3.');
  console.log('─────────────────────────────────────────');
}

// ─── Entry point (direct run) ─────────────────────────────────────────────────

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.url.replace('file://', ''))) {
  const taskDescription = process.argv[2];
  if (!taskDescription) {
    console.error('Usage: npx tsx cleanclaw/core/pipeline.ts "Your task description"');
    process.exit(1);
  }

  const config = getConfig();
  runPipeline(taskDescription, config).catch(err => {
    console.error('[CleanClaw] Pipeline failed:', err.message);
    process.exit(1);
  });
}
