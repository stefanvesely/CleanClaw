import path from 'path';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { loadProjectSettings } from '../core/project-settings.js';
import { resolveActiveProject } from '../core/project-resolver.js';

export interface InteractiveSessionResult {
  taskDescription: string | null;
  projectRoot: string | null;
  projectConfirmed: boolean;
}

export interface InteractiveSessionOptions {
  cwd?: string;
  ask?: (question: string) => Promise<string>;
  logger?: CleanClawLogger;
}

export async function startInteractiveSession(
  options: InteractiveSessionOptions = {},
): Promise<InteractiveSessionResult> {
  const logger = options.logger ?? createConsoleLogger();
  const ask = options.ask ?? defaultAsk;
  const resolvedProject = resolveActiveProject({ cwd: options.cwd });

  logger.info('CleanClaw is ready.');
  logger.info('I will ask what we are working on before assuming which project is correct.');

  const taskDescription = await ask('What are we working on today? ');
  if (!taskDescription.trim()) {
    logger.info('No task captured. Nothing will change.');
    return {
      taskDescription: null,
      projectRoot: resolvedProject.projectRoot,
      projectConfirmed: false,
    };
  }

  if (!resolvedProject.projectRoot) {
    logger.info('I do not know the project yet. Next I need to infer or ask which project this task belongs to.');
    return {
      taskDescription,
      projectRoot: null,
      projectConfirmed: false,
    };
  }

  const settings = loadProjectSettings(resolvedProject.projectRoot);
  const projectName = settings?.projectName ?? path.basename(resolvedProject.projectRoot);
  logger.info(`Hi, I see we are in a project folder for ${projectName}.`);
  logger.info(`Project root: ${resolvedProject.projectRoot}`);
  logger.info(`Resolved by: ${resolvedProject.source}`);

  const confirm = await ask(`Do you want to scope today's work in this folder? [Y/n]: `);
  const projectConfirmed = confirm.trim() === '' || confirm.trim().toLowerCase() === 'y';

  if (projectConfirmed) {
    logger.info(`Project confirmed: ${projectName}.`);
    logger.info('Next step: search in-progress plans, then continue or start a new plan.');
  } else {
    logger.info('Project not confirmed. Next step: infer or ask for the correct project directory.');
  }

  return {
    taskDescription,
    projectRoot: resolvedProject.projectRoot,
    projectConfirmed,
  };
}

async function defaultAsk(question: string): Promise<string> {
  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
