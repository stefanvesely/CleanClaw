import fs from 'fs';

export interface DiffCapture {
  filename: string;
  lines: { lineNumber: number; content: string }[];
  isNewFile: boolean;
}

export function captureBeforeState(filename: string, lineNumbers: number[]): DiffCapture {
  if (!fs.existsSync(filename)) {
    return { filename, lines: [], isNewFile: true };
  }

  const all = fs.readFileSync(filename, 'utf-8').split('\n');

  const lines = lineNumbers.map(n => ({
    lineNumber: n,
    content: all[n - 1] ?? '(line does not exist)',
  }));

  return { filename, lines, isNewFile: false };
}
