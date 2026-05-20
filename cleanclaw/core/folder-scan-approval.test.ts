import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryLogger } from './logger.js';
import {
  ensureBroadFolderScanApproved,
  folderScanApprovalPath,
  loadFolderScanApprovalRecords,
  parseExclusions,
} from './folder-scan-approval.js';

describe('folder scan approval', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-folder-scan-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('records approved broad folder scans', async () => {
    const answers = ['y', 'node_modules, .env'];
    const approved = await ensureBroadFolderScanApproved({
      projectRoot: tmpDir,
      reason: 'find relevant files',
      ask: async () => answers.shift() ?? '',
      timestamp: '2026-05-18T00:00:00.000Z',
      logger: createMemoryLogger(),
    });

    expect(approved).toBe(true);
    expect(folderScanApprovalPath(tmpDir)).toBe(path.join(tmpDir, '.cleanclaw', 'scan-approval-records.json'));
    expect(loadFolderScanApprovalRecords(tmpDir)).toEqual([
      {
        timestamp: '2026-05-18T00:00:00.000Z',
        projectRoot: path.resolve(tmpDir),
        reason: 'find relevant files',
        exclusions: ['node_modules', '.env'],
        approved: true,
        userText: 'y',
      },
    ]);
  });

  it('records denied broad folder scans', async () => {
    const approved = await ensureBroadFolderScanApproved({
      projectRoot: tmpDir,
      reason: 'find relevant files',
      ask: async () => 'n',
      timestamp: '2026-05-18T00:00:00.000Z',
      logger: createMemoryLogger(),
    });

    expect(approved).toBe(false);
    expect(loadFolderScanApprovalRecords(tmpDir)[0]).toMatchObject({
      approved: false,
      exclusions: [],
      userText: 'n',
    });
  });

  it('fails closed in headless mode and records the denial', async () => {
    await expect(ensureBroadFolderScanApproved({
      projectRoot: tmpDir,
      reason: 'find relevant files',
      headless: true,
      timestamp: '2026-05-18T00:00:00.000Z',
      logger: createMemoryLogger(),
    })).rejects.toThrow(/requires interactive approval/i);

    expect(loadFolderScanApprovalRecords(tmpDir)[0]).toMatchObject({
      approved: false,
      exclusions: [],
      userText: 'headless mode cannot approve broad folder scan',
    });
  });

  it('parses comma-separated exclusions', () => {
    expect(parseExclusions('node_modules, dist, node_modules, .env')).toEqual([
      'node_modules',
      'dist',
      '.env',
    ]);
  });
});
