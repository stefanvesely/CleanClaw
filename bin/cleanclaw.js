#!/usr/bin/env node
import { program } from 'commander';

program
  .name('cleanclaw')
  .description('Audit trail and human approval layer for AI-assisted coding')
  .version('0.1.0');

program
  .command('init')
  .description('Initialise a project')
  .action(async () => {
    const { runSetupWizard } = await import('../cleanclaw/cli/setup-wizard.ts');
    await runSetupWizard();
  });

program
  .command('run <task>')
  .description('Run a task')
  .action(async (task) => {
    const { runWorkflow } = await import('../cleanclaw/cli/run-workflow.ts');
    await runWorkflow(task);
  });

program
  .command('switch <project>')
  .description('Switch active project')
  .action(async (project) => {
    const { switchProject } = await import('../cleanclaw/cli/switch-project.ts');
    await switchProject(project);
  });

program
  .command('status')
  .description('Show current project status')
  .action(async () => {
    const { showStatus } = await import('../cleanclaw/cli/show-status.ts');
    await showStatus();
  });

program.parse();
