import path from 'path';

export class RootViolationError extends Error {
  constructor(filePath: string, activeRoot: string) {
    super(
      `[CleanClaw] ROOT VIOLATION: "${filePath}" is outside the active project root "${activeRoot}". Change blocked.`
    );
    this.name = 'RootViolationError';
  }
}

export function assertWithinProjectRoot(filePath: string, activeRoot: string): void {
  const resolvedFile = path.resolve(filePath);
  const resolvedRoot = path.resolve(activeRoot);

  // Ensure root ends with separator so "projects/foo" doesn't match "projects/foobar"
  const rootWithSep = resolvedRoot.endsWith(path.sep) ? resolvedRoot : resolvedRoot + path.sep;

  if (!resolvedFile.startsWith(rootWithSep) && resolvedFile !== resolvedRoot) {
    throw new RootViolationError(resolvedFile, resolvedRoot);
  }
}

export async function promptDeclareProjectRoot(): Promise<string> {
  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const root = await new Promise<string>(resolve => {
    rl.question(
      '\n[CleanClaw] No active project set.\nEnter the absolute path to your project root: ',
      answer => { rl.close(); resolve(answer.trim()); }
    );
  });

  if (!root) {
    throw new Error('[CleanClaw] Project root cannot be empty.');
  }

  return path.resolve(root);
}
