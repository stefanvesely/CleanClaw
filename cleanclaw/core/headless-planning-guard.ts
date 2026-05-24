export function assertPlanningIsInteractive(options: {
  headless: boolean;
  phase: 'intake' | 'why' | 'scope' | 'plan' | 'plan-approval';
}): void {
  if (!options.headless) return;

  throw new Error(`Planning phase "${options.phase}" cannot run headless. The user must approve planning decisions.`);
}
