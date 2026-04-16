import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { getConfig } from '../core/config-loader.js';
import { appendRollbackEntry } from '../plans/log-writer.js';

interface LogEntry {
  changeNumber: number;
  filename: string;
  isNewFile: boolean;
  before: { lineNumber: number; content: string }[];
  after: { lineNumber: number; content: string }[];
  why: string;
  model: string;
  timestamp: string;
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, a => resolve(a.trim())));
}

function parseJsonLog(logPath: string): LogEntry[] {
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(l => l.trim());
  return lines
    .map(line => { try { return JSON.parse(line) as LogEntry; } catch { return null; } })
    .filter((e): e is LogEntry => e !== null && e.changeNumber !== undefined);
}

function restoreEntry(entry: LogEntry, projectRoot: string): void {
  const absPath = path.isAbsolute(entry.filename)
    ? entry.filename
    : path.join(projectRoot, entry.filename);

  if (entry.isNewFile) {
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
    return;
  }

  const restored = entry.before.map(l => l.content).join('\n');
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, restored, 'utf-8');
}

export async function undoTask(taskId: string): Promise<void> {
  const config = getConfig();
  const plansDir = path.resolve(config.plansDir);
  const taskDir = path.join(plansDir, `task${taskId}`);
  const logPath = path.join(taskDir, `task${taskId}A_log.json`);

  if (!fs.existsSync(logPath)) {
    console.error(`No JSON audit log found for task${taskId} at ${logPath}`);
    console.error('Rollback requires logFormat: json in cleanclaw.config.json');
    process.exit(1);
  }

  const entries = parseJsonLog(logPath).filter(e => !('type' in e));
  if (entries.length === 0) {
    console.log(`No applied changes found in log for task${taskId}.`);
    return;
  }

  const projectRoot = process.cwd();
  const modifiedFiles: string[] = [];

  for (const entry of entries) {
    if (entry.isNewFile) continue;
    const absPath = path.isAbsolute(entry.filename)
      ? entry.filename
      : path.join(projectRoot, entry.filename);
    if (!fs.existsSync(absPath)) continue;
    const mtime = fs.statSync(absPath).mtimeMs;
    const logTime = Date.parse(entry.timestamp);
    if (mtime > logTime) modifiedFiles.push(entry.filename);
  }

  if (modifiedFiles.length > 0) {
    console.warn('\n[CleanClaw] Warning: the following files have been modified since this task was applied:');
    modifiedFiles.forEach(f => console.warn(`  - ${f}`));
    console.warn('Proceeding will overwrite these changes.\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await ask(rl, 'Proceed with rollback? [y/n]: ');
    rl.close();
    if (answer.toLowerCase() !== 'y') {
      console.log('Rollback cancelled.');
      return;
    }
  }

  console.log(`\n[CleanClaw] Rolling back task${taskId} (${entries.length} changes in reverse)...`);

  const reversed = [...entries].reverse();
  const restoredFiles: string[] = [];

  for (const entry of reversed) {
    restoreEntry(entry, projectRoot);
    restoredFiles.push(entry.filename);
    console.log(`  Restored: ${entry.filename}`);
  }

  appendRollbackEntry(taskId, 'A', restoredFiles, plansDir, config.logFormat ?? 'json');
  console.log(`\n[CleanClaw] Rollback complete. ${restoredFiles.length} file(s) restored.`);
}
