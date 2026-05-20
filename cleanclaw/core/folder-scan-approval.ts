import fs from 'fs';
import path from 'path';
import { createConsoleLogger, type CleanClawLogger } from './logger.js';

const CLEANCLAW_DIR = '.cleanclaw';
const SCAN_APPROVALS_FILE = 'scan-approval-records.json';

export interface FolderScanApprovalRecord {
  timestamp: string;
  projectRoot: string;
  reason: string;
  exclusions: string[];
  approved: boolean;
  userText: string;
}

export interface FolderScanApprovalOptions {
  projectRoot: string;
  reason: string;
  headless?: boolean;
  logger?: CleanClawLogger;
  ask?: (question: string) => Promise<string>;
  timestamp?: string;
}

export async function ensureBroadFolderScanApproved(options: FolderScanApprovalOptions): Promise<boolean> {
  const logger = options.logger ?? createConsoleLogger();
  const projectRoot = path.resolve(options.projectRoot);
  const reason = options.reason.trim() || 'project context scan';

  logger.info('[CleanClaw] Broad folder scan requested.');
  logger.info(`Project root: ${projectRoot}`);
  logger.info(`Reason: ${reason}`);

  if (options.headless) {
    saveFolderScanApprovalRecord(projectRoot, {
      timestamp: options.timestamp ?? new Date().toISOString(),
      projectRoot,
      reason,
      exclusions: [],
      approved: false,
      userText: 'headless mode cannot approve broad folder scan',
    });
    throw new Error('[CleanClaw] Broad folder scanning requires interactive approval.');
  }

  const answer = options.ask
    ? await options.ask('Approve broad project file scan? [y/N]: ')
    : 'n';
  const approved = answer.trim().toLowerCase() === 'y';
  const exclusions = approved && options.ask
    ? parseExclusions(await options.ask("I need to scan the project. Is there anything I don't need to scan? [Enter=none]: "))
    : [];
  if (exclusions.length > 0) {
    logger.info(`[CleanClaw] Scan exclusions: ${exclusions.join(', ')}`);
  }
  saveFolderScanApprovalRecord(projectRoot, {
    timestamp: options.timestamp ?? new Date().toISOString(),
    projectRoot,
    reason,
    exclusions,
    approved,
    userText: answer,
  });

  if (!approved) {
    logger.info('[CleanClaw] Broad folder scan skipped. You can specify files manually.');
  }

  return approved;
}

export function folderScanApprovalPath(projectRoot: string): string {
  return path.join(projectRoot, CLEANCLAW_DIR, SCAN_APPROVALS_FILE);
}

export function saveFolderScanApprovalRecord(
  projectRoot: string,
  record: FolderScanApprovalRecord,
): string {
  const filepath = folderScanApprovalPath(projectRoot);
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  const records = loadFolderScanApprovalRecords(projectRoot);
  records.push(record);
  fs.writeFileSync(filepath, `${JSON.stringify(records, null, 2)}\n`, 'utf-8');
  return filepath;
}

export function loadFolderScanApprovalRecords(projectRoot: string): FolderScanApprovalRecord[] {
  const filepath = folderScanApprovalPath(projectRoot);
  if (!fs.existsSync(filepath)) return [];
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as FolderScanApprovalRecord[];
}

export function parseExclusions(input: string): string[] {
  return Array.from(new Set(input
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)));
}
