import fs from 'fs';
import path from 'path';
import type {
  ApprovalRecord,
  CleanClawTaskState,
  WhyAlignmentRecord,
} from './control-contract.js';

const CLEANCLAW_DIR = '.cleanclaw';
const TASKS_DIR = 'tasks';
const STATE_FILE = 'state.json';
const APPROVALS_FILE = 'approval-records.json';
const WHY_ALIGNMENT_FILE = 'why-alignment-records.json';

export function taskRecordDir(projectRoot: string, taskId: string): string {
  return path.join(projectRoot, CLEANCLAW_DIR, TASKS_DIR, taskId);
}

export function ensureTaskRecordDir(projectRoot: string, taskId: string): string {
  const dir = taskRecordDir(projectRoot, taskId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveTaskState(projectRoot: string, state: CleanClawTaskState): string {
  const dir = ensureTaskRecordDir(projectRoot, state.taskId);
  const filepath = path.join(dir, STATE_FILE);
  fs.writeFileSync(filepath, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
  return filepath;
}

export function loadTaskState(projectRoot: string, taskId: string): CleanClawTaskState | null {
  const filepath = path.join(taskRecordDir(projectRoot, taskId), STATE_FILE);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as CleanClawTaskState;
}

export function appendApprovalRecord(
  projectRoot: string,
  taskId: string,
  record: ApprovalRecord,
): string {
  return appendJsonRecord(projectRoot, taskId, APPROVALS_FILE, record);
}

export function loadApprovalRecords(projectRoot: string, taskId: string): ApprovalRecord[] {
  return loadJsonRecords<ApprovalRecord>(projectRoot, taskId, APPROVALS_FILE);
}

export function appendWhyAlignmentRecord(
  projectRoot: string,
  taskId: string,
  record: WhyAlignmentRecord,
): string {
  return appendJsonRecord(projectRoot, taskId, WHY_ALIGNMENT_FILE, record);
}

export function loadWhyAlignmentRecords(projectRoot: string, taskId: string): WhyAlignmentRecord[] {
  return loadJsonRecords<WhyAlignmentRecord>(projectRoot, taskId, WHY_ALIGNMENT_FILE);
}

function appendJsonRecord<T>(projectRoot: string, taskId: string, filename: string, record: T): string {
  const dir = ensureTaskRecordDir(projectRoot, taskId);
  const filepath = path.join(dir, filename);
  const records = loadJsonRecords<T>(projectRoot, taskId, filename);
  records.push(record);
  fs.writeFileSync(filepath, `${JSON.stringify(records, null, 2)}\n`, 'utf-8');
  return filepath;
}

function loadJsonRecords<T>(projectRoot: string, taskId: string, filename: string): T[] {
  const filepath = path.join(taskRecordDir(projectRoot, taskId), filename);
  if (!fs.existsSync(filepath)) return [];
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as T[];
}
