import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { formatInProgressPlanChoices, listInProgressPlans, type InProgressPlanSummary } from '../core/plan-discovery.js';
import {
  buildProjectIntakeCandidate,
  formatProjectIntakeCandidate,
  resolveUserProjectDirectory,
  type ProjectIntakeCandidate,
} from '../core/project-intake.js';
import { resolveActiveProject } from '../core/project-resolver.js';
import { createApprovedTaskWhy, draftTaskWhy, type TaskWhyIntake } from '../core/task-why.js';

export interface InteractiveSessionResult {
  taskDescription: string | null;
  projectRoot: string | null;
  projectConfirmed: boolean;
  taskWhy: TaskWhyIntake | null;
  planChoice: 'continue' | 'new' | null;
  selectedPlan: InProgressPlanSummary | null;
}

export interface InteractiveSessionOptions {
  cwd?: string;
  globalProject?: string | null;
  ask?: (question: string) => Promise<string>;
  logger?: CleanClawLogger;
}

export async function startInteractiveSession(
  options: InteractiveSessionOptions = {},
): Promise<InteractiveSessionResult> {
  const logger = options.logger ?? createConsoleLogger();
  const ask = options.ask ?? defaultAsk;
  const resolvedProject = resolveActiveProject({ cwd: options.cwd, globalProject: options.globalProject });

  logger.info('CleanClaw is ready.');
  logger.info('I will ask what we are working on before assuming which project is correct.');

  const taskDescription = await ask('What are we working on today? ');
  if (!taskDescription.trim()) {
    logger.info('No task captured. Nothing will change.');
    return {
      taskDescription: null,
      projectRoot: resolvedProject.projectRoot,
      projectConfirmed: false,
      taskWhy: null,
      planChoice: null,
      selectedPlan: null,
    };
  }

  const initialCandidate = buildProjectIntakeCandidate(resolvedProject);
  const confirmedProject = await confirmProjectCandidate({
    ask,
    cwd: options.cwd,
    logger,
    taskDescription,
    candidate: initialCandidate,
  });

  if (confirmedProject) {
    logger.info(`Project confirmed: ${confirmedProject.projectName}.`);
    const taskWhy = await confirmTaskWhy({
      ask,
      logger,
      projectName: confirmedProject.projectName,
      taskDescription,
    });
    if (!taskWhy) {
      return {
        taskDescription,
        projectRoot: confirmedProject.projectRoot,
        projectConfirmed: true,
        taskWhy: null,
        planChoice: null,
        selectedPlan: null,
      };
    }

    const plans = listInProgressPlans(confirmedProject.projectRoot);
    if (plans.length === 0) {
      logger.info('No in-progress plans found for this project. Next step: start a new plan.');
      return {
        taskDescription,
        projectRoot: confirmedProject.projectRoot,
        projectConfirmed: true,
        taskWhy,
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
          projectRoot: confirmedProject.projectRoot,
          projectConfirmed: true,
          taskWhy,
          planChoice: 'new',
          selectedPlan: null,
        };
      }

      logger.info('Existing plan confirmed. Next step: load planning context.');
      return {
        taskDescription,
        projectRoot: confirmedProject.projectRoot,
        projectConfirmed: true,
        taskWhy,
        planChoice,
        selectedPlan,
      };
    }

    logger.info('Starting a new plan for this project.');
    return {
      taskDescription,
      projectRoot: confirmedProject.projectRoot,
      projectConfirmed: true,
      taskWhy,
      planChoice,
      selectedPlan: null,
    };
  }

  return {
    taskDescription,
    projectRoot: initialCandidate?.projectRoot ?? null,
    projectConfirmed: false,
    taskWhy: null,
    planChoice: null,
    selectedPlan: null,
  };
}

async function confirmTaskWhy(options: {
  ask: (question: string) => Promise<string>;
  logger: CleanClawLogger;
  projectName: string;
  taskDescription: string;
}): Promise<TaskWhyIntake | null> {
  const proposedWhy = draftTaskWhy(options.taskDescription, options.projectName);
  options.logger.info('Before planning scope, I need the task why confirmed.');
  options.logger.info(`Proposed why: ${proposedWhy}`);

  const userText = await options.ask('Use this why, or type a replacement? [Enter=use/replacement]: ');
  const whyText = userText.trim() ? userText : proposedWhy;
  const approvedWhy = createApprovedTaskWhy(whyText, userText.trim() ? userText : 'accepted proposed why');
  if (!approvedWhy) {
    options.logger.info('No task why approved. Nothing will change.');
    return null;
  }

  options.logger.info(`Task why approved: ${approvedWhy.text}`);
  return approvedWhy;
}

async function confirmProjectCandidate(options: {
  ask: (question: string) => Promise<string>;
  cwd?: string;
  logger: CleanClawLogger;
  taskDescription: string;
  candidate: ProjectIntakeCandidate | null;
}): Promise<ProjectIntakeCandidate | null> {
  const { ask, cwd, logger, taskDescription } = options;
  let { candidate } = options;

  if (candidate) {
    logger.info(`Hi, I see we are in a project folder for ${candidate.projectName}.`);
    logger.info(formatProjectIntakeCandidate(candidate, taskDescription));
    const confirm = await ask(`Do you want to scope today's work in this folder? [Y/n]: `);
    if (isYes(confirm)) return candidate;
    logger.info('Project not confirmed. I need the correct project directory before I can inspect plans.');
  } else {
    logger.info('I do not know the project yet. I need the project directory before I can inspect plans.');
  }

  const directory = await ask('What project directory should CleanClaw use for this task? ');
  candidate = resolveUserProjectDirectory(directory, cwd);
  if (!candidate) {
    logger.info('Project directory was not found or was not a folder. Nothing will change.');
    return null;
  }

  logger.info(formatProjectIntakeCandidate(candidate, taskDescription));
  const confirm = await ask('Use this project directory? [Y/n]: ');
  if (isYes(confirm)) return candidate;

  logger.info('Project directory not confirmed. Nothing will change.');
  return null;
}

function isYes(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return trimmed === '' || trimmed === 'y' || trimmed === 'yes';
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
