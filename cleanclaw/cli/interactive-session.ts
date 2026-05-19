import path from 'path';
import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { formatInProgressPlanChoices, listInProgressPlans, type InProgressPlanSummary } from '../core/plan-discovery.js';
import { loadProjectSettings } from '../core/project-settings.js';
import { resolveActiveProject } from '../core/project-resolver.js';

export interface InteractiveSessionResult {
  taskDescription: string | null;
  projectRoot: string | null;
  projectConfirmed: boolean;
  planChoice: 'continue' | 'new' | null;
  selectedPlan: InProgressPlanSummary | null;
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
      planChoice: null,
      selectedPlan: null,
    };
  }

  if (!resolvedProject.projectRoot) {
    logger.info('I do not know the project yet. Next I need to infer or ask which project this task belongs to.');
    return {
      taskDescription,
      projectRoot: null,
      projectConfirmed: false,
      planChoice: null,
      selectedPlan: null,
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
    const plans = listInProgressPlans(resolvedProject.projectRoot);
    if (plans.length === 0) {
      logger.info('No in-progress plans found for this project. Next step: start a new plan.');
      return {
        taskDescription,
        projectRoot: resolvedProject.projectRoot,
        projectConfirmed,
        planChoice: 'new',
        selectedPlan: null,
      };
    }

    logger.info(`I found ${plans.length} in-progress plan${plans.length === 1 ? '' : 's'} in this project.`);
    logger.info(formatInProgressPlanChoices(plans));
    const choice = await ask('Continue one of these plans, or start new? [continue/new]: ');
    const normalizedChoice = choice.trim().toLowerCase();
    const planChoice = normalizedChoice.startsWith('c') ? 'continue' : 'new';

    if (planChoice === 'continue') {
      const selectedPlan = plans[0];
      logger.info(`Selected plan: ${selectedPlan.title}`);
      logger.info(`Summary: ${selectedPlan.preview}`);
      const stillOkay = await ask('Is this still okay? [Y/n]: ');
      if (stillOkay.trim() !== '' && stillOkay.trim().toLowerCase() !== 'y') {
        logger.info('Plan not confirmed. Next step: start a new plan or revise the existing plan.');
        return {
          taskDescription,
          projectRoot: resolvedProject.projectRoot,
          projectConfirmed,
          planChoice: 'new',
          selectedPlan: null,
        };
      }

      logger.info('Existing plan confirmed. Next step: load planning context.');
      return {
        taskDescription,
        projectRoot: resolvedProject.projectRoot,
        projectConfirmed,
        planChoice,
        selectedPlan,
      };
    }

    logger.info('Starting a new plan for this project.');
    return {
      taskDescription,
      projectRoot: resolvedProject.projectRoot,
      projectConfirmed,
      planChoice,
      selectedPlan: null,
    };
  } else {
    logger.info('Project not confirmed. Next step: infer or ask for the correct project directory.');
  }

  return {
    taskDescription,
    projectRoot: resolvedProject.projectRoot,
    projectConfirmed,
    planChoice: null,
    selectedPlan: null,
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
