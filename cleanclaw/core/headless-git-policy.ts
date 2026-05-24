export function assertHeadlessCanCommit(headless: boolean): void {
  if (!headless) return;

  throw new Error('Headless execution must never commit. Commits require explicit user action outside headless mode.');
}
