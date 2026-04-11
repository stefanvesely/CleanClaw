import fs from 'fs';
import path from 'path';

export interface DiffCapture {
  filename: string;
  lines: { lineNumber: number; content: string }[];
  isNewFile: boolean;
  warning?: string;
}

export function captureBeforeState(filename: string, lineNumbers: number[]): DiffCapture {
  const BINARY_EXTENSIONS = ['.png', '.jpg', '.gif', '.exe', '.dll', '.wasm'];
  if (BINARY_EXTENSIONS.includes(path.extname(filename))) {
    return { filename, lines: [], isNewFile: false, warning: 'Binary file — diff skipped' };
  }

  if (!fs.existsSync(filename)) {
    return { filename, lines: [], isNewFile: true };
  }

  let all: string[];
  try {
    all = fs.readFileSync(filename, 'utf-8').split('\n');
  } catch {
    return { filename, lines: [], isNewFile: false, warning: 'Could not read file as UTF-8 — encoding unknown' };
  }

  const lines = lineNumbers.map(n => ({
    lineNumber: n,
    content: n > all.length ? `(file ends at line ${all.length})` : all[n - 1],
  }));

  return { filename, lines, isNewFile: false };
}
