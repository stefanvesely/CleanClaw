#!/usr/bin/env -S npx tsx
import { program } from "commander";

program
  .name("cleanclaw")
  .description("Audit trail and human approval layer for AI-assisted coding")
  .version("0.1.0");

program
  .command("init")
  .description("Initialise a project")
  .action(async () => {
    const { runSetupWizard } = await import("../cleanclaw/cli/setup-wizard.js");
    await runSetupWizard();
  });

program
  .command("run <task>")
  .description("Run a task")
  .option("--headless", "Run without interactive prompts — scope violations exit with code 1")
  .action(async (task, options) => {
    const { runWorkflow } = await import("../cleanclaw/cli/run-workflow.js");
    await runWorkflow(task, options.headless ?? false);
  });

program
  .command("switch <project>")
  .description("Switch active project")
  .action(async (project) => {
    const { switchProject } = await import("../cleanclaw/cli/switch-project.js");
    await switchProject(project);
  });

program
  .command("status")
  .description("Show current project status")
  .action(async () => {
    const { showStatus } = await import("../cleanclaw/cli/show-status.js");
    await showStatus();
  });

program
  .command("projects")
  .description("List registered projects")
  .action(async () => {
    const { listProjects } = await import("../cleanclaw/projectmap/list-projects.js");
    listProjects(process.cwd());
  });

program
  .command("undo <taskId>")
  .description("Roll back all changes from a completed task")
  .action(async (taskId) => {
    const { undoTask } = await import("../cleanclaw/cli/undo.js");
    await undoTask(taskId);
  });

program.parse();
