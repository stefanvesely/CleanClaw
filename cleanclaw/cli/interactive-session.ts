import { createConsoleLogger, type CleanClawLogger } from '../core/logger.js';
import { formatInProgressPlanChoices, listInProgressPlans, type InProgressPlanSummary } from '../core/plan-discovery.js';
import { approveWhy, createTaskState, transitionTaskState } from '../core/control-contract.js';
import {
  buildProjectIntakeCandidate,
  formatProjectIntakeCandidate,
  resolveUserProjectDirectory,
  type ProjectIntakeCandidate,
} from '../core/project-intake.js';
import { classifyProjectQuestion, formatProjectQuestionResponse } from '../core/project-question.js';
import { resolveActiveProject } from '../core/project-resolver.js';
import { createDraftSessionPlan } from '../core/session-plan.js';
import { createApprovedTaskWhy, draftTaskWhy, type TaskWhyIntake } from '../core/task-why.js';
import { nextTaskId, saveTaskState } from '../core/task-records.js';
import { formatNumberedPrompt, parseNumberedPromptSelection, type NumberedPromptOption } from '../core/numbered-prompt.js';

export interface InteractiveSessionResult {
  taskDescription: string | null;
  projectRoot: string | null;
  projectConfirmed: boolean;
  taskWhy: TaskWhyIntake | null;
  taskId: string | null;
  taskStatePath: string | null;
  draftPlanPath: string | null;
  mode: 'planning' | 'read-only-question' | null;
  planChoice: 'continue' | 'new' | null;
  selectedPlan: InProgressPlanSummary | null;
}

export interface InteractiveSessionOptions {
  cwd?: string;
  globalProject?: string | null;
  initialTaskDescription?: string | null;
  ask?: (question: string) => Promise<string>;
  logger?: CleanClawLogger;
}

export interface InteractiveLoopResult {
  sessions: InteractiveSessionResult[];
  exited: boolean;
}

export async function startInteractiveLoop(
  options: InteractiveSessionOptions & { maxTurns?: number } = {},
): Promise<InteractiveLoopResult> {
  const ask = options.ask ?? defaultAsk;
  const logger = options.logger ?? createConsoleLogger();
  const sessions: InteractiveSessionResult[] = [];
  const maxTurns = options.maxTurns ?? Number.POSITIVE_INFINITY;
  let queuedTask: string | null = null;

  while (sessions.length < maxTurns) {
    const result = await startInteractiveSession({ ...options, ask, logger, initialTaskDescription: queuedTask });
    queuedTask = null;
    sessions.push(result);

    if (!result.taskDescription) {
      logger.info('Leaving CleanClaw session.');
      return { sessions, exited: true };
    }

    const nextSelection = parseNumberedPromptSelection(await ask(formatNumberedPrompt(nextActionPrompt())), {
      question: 'What next?',
      options: nextActionOptions(),
      defaultId: 'new-task',
      allowNaturalLanguage: true,
    });

    if (nextSelection.kind === 'control' && (nextSelection.control === 'exit' || nextSelection.control === 'cancel')) {
      logger.info('Leaving CleanClaw session.');
      return { sessions, exited: true };
    }

    if (nextSelection.kind === 'option' && nextSelection.option.id === 'exit') {
      logger.info('Leaving CleanClaw session.');
      return { sessions, exited: true };
    }

    if (nextSelection.kind === 'natural-language') {
      queuedTask = nextSelection.text;
    }

    logger.info('Continuing CleanClaw session.');
  }

  return { sessions, exited: false };
}

export async function startInteractiveSession(
  options: InteractiveSessionOptions = {},
): Promise<InteractiveSessionResult> {
  const logger = options.logger ?? createConsoleLogger();
  const ask = options.ask ?? defaultAsk;
  const resolvedProject = resolveActiveProject({ cwd: options.cwd, globalProject: options.globalProject });

  logger.info('CleanClaw is ready.');
  logger.info('I will ask what we are working on before assuming which project is correct.');

  const taskDescription = options.initialTaskDescription ?? await ask('What are we working on today? ');
  if (!taskDescription.trim()) {
    logger.info('No task captured. Nothing will change.');
    return {
      taskDescription: null,
      projectRoot: resolvedProject.projectRoot,
      projectConfirmed: false,
      taskWhy: null,
      taskId: null,
      taskStatePath: null,
      draftPlanPath: null,
      mode: null,
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
    const questionClassification = classifyProjectQuestion(taskDescription);
    if (questionClassification.isProjectQuestion) {
      logger.info(formatProjectQuestionResponse(taskDescription));
      logger.info(questionClassification.reason);
      return {
        taskDescription,
        projectRoot: confirmedProject.projectRoot,
        projectConfirmed: true,
        taskWhy: null,
        taskId: null,
        taskStatePath: null,
        draftPlanPath: null,
        mode: 'read-only-question',
        planChoice: null,
        selectedPlan: null,
      };
    }

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
        taskId: null,
        taskStatePath: null,
        draftPlanPath: null,
        mode: null,
        planChoice: null,
        selectedPlan: null,
      };
    }

    const taskRecord = saveInteractiveTaskState({
      projectRoot: confirmedProject.projectRoot,
      taskDescription,
      taskWhy,
    });
    logger.info(`Task record created: ${taskRecord.taskStatePath}`);

    const plans = listInProgressPlans(confirmedProject.projectRoot);
    if (plans.length === 0) {
      logger.info('No in-progress plans found for this project. Next step: start a new plan.');
      const draftPlanPath = await createNewDraftPlan({
        ask,
        logger,
        projectRoot: confirmedProject.projectRoot,
        taskDescription,
        taskWhy,
        taskId: taskRecord.taskId,
      });
      return {
        taskDescription,
        projectRoot: confirmedProject.projectRoot,
        projectConfirmed: true,
        taskWhy,
        taskId: taskRecord.taskId,
        taskStatePath: taskRecord.taskStatePath,
        draftPlanPath,
        mode: 'planning',
        planChoice: 'new',
        selectedPlan: null,
      };
    }

    logger.info(`I found ${plans.length} in-progress plan${plans.length === 1 ? '' : 's'} in this project.`);
    logger.info(formatInProgressPlanChoices(plans));
    const selection = parseNumberedPromptSelection(await ask(formatNumberedPrompt(planChoicePrompt())), planChoicePrompt());
    const planChoice = selection.kind === 'option' && selection.option.id === 'continue-plan'
      ? 'continue'
      : selection.kind === 'natural-language' && selection.text.toLowerCase().includes('continue')
        ? 'continue'
        : 'new';

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
          taskId: taskRecord.taskId,
          taskStatePath: taskRecord.taskStatePath,
          draftPlanPath: null,
          mode: 'planning',
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
        taskId: taskRecord.taskId,
        taskStatePath: taskRecord.taskStatePath,
        draftPlanPath: null,
        mode: 'planning',
        planChoice,
        selectedPlan,
      };
    }

    logger.info('Starting a new plan for this project.');
    const draftPlanPath = await createNewDraftPlan({
      ask,
      logger,
      projectRoot: confirmedProject.projectRoot,
      taskDescription,
      taskWhy,
      taskId: taskRecord.taskId,
    });
    return {
      taskDescription,
      projectRoot: confirmedProject.projectRoot,
      projectConfirmed: true,
      taskWhy,
      taskId: taskRecord.taskId,
      taskStatePath: taskRecord.taskStatePath,
      draftPlanPath,
      mode: 'planning',
      planChoice,
      selectedPlan: null,
    };
  }

  return {
    taskDescription,
    projectRoot: initialCandidate?.projectRoot ?? null,
    projectConfirmed: false,
    taskWhy: null,
    taskId: null,
    taskStatePath: null,
    draftPlanPath: null,
    mode: null,
    planChoice: null,
    selectedPlan: null,
  };
}

function nextActionPrompt() {
  return {
    question: 'What next?',
    options: nextActionOptions(),
    defaultId: 'new-task',
    allowNaturalLanguage: true,
  };
}

function nextActionOptions(): NumberedPromptOption[] {
  return [
    {
      id: 'new-task',
      label: 'Start or continue work',
      description: 'Describe the next task or project question.',
      recommended: true,
    },
    {
      id: 'exit',
      label: 'Exit CleanClaw',
      description: 'Leave this interactive session.',
    },
  ];
}

function planChoicePrompt() {
  return {
    question: 'I found existing plans. What should CleanClaw do?',
    options: [
      {
        id: 'continue-plan',
        label: 'Continue an existing plan',
        description: 'Review the current plan summary before continuing.',
        recommended: true,
      },
      {
        id: 'new-plan',
        label: 'Start a new plan',
        description: 'Create a fresh plan for this task.',
      },
    ],
    defaultId: 'continue-plan',
    allowNaturalLanguage: true,
  };
}

async function createNewDraftPlan(input: {
  ask: (question: string) => Promise<string>;
  logger: CleanClawLogger;
  projectRoot: string;
  taskDescription: string;
  taskWhy: TaskWhyIntake;
  taskId: string;
}): Promise<string> {
  const requester = await input.ask('Who requested this work? [Enter=not specified]: ');
  const beneficiary = await input.ask('Who is this change for? [Enter=not specified]: ');
  const draftPlanPath = createDraftSessionPlan({
    projectRoot: input.projectRoot,
    taskDescription: input.taskDescription,
    taskWhy: input.taskWhy,
    requester,
    beneficiary,
    taskId: input.taskId,
  });

  input.logger.info(`Draft plan created: ${draftPlanPath}`);
  return draftPlanPath;
}

function saveInteractiveTaskState(input: {
  projectRoot: string;
  taskDescription: string;
  taskWhy: TaskWhyIntake;
}): { taskId: string; taskStatePath: string } {
  const taskId = nextTaskId(input.projectRoot);
  const intakeState = createTaskState({
    taskId,
    projectRoot: input.projectRoot,
    taskSummary: input.taskDescription,
  });
  const whyState = approveWhy(
    transitionTaskState(intakeState, 'why_definition'),
    input.taskWhy.text,
    input.taskWhy.approvedByUserText,
  );

  return {
    taskId,
    taskStatePath: saveTaskState(input.projectRoot, whyState),
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
    const confirm = parseNumberedPromptSelection(await ask(formatNumberedPrompt(projectConfirmPrompt())), projectConfirmPrompt());
    if (isConfirmProject(confirm)) return candidate;
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
  const confirm = parseNumberedPromptSelection(await ask(formatNumberedPrompt(projectConfirmPrompt())), projectConfirmPrompt());
  if (isConfirmProject(confirm)) return candidate;

  logger.info('Project directory not confirmed. Nothing will change.');
  return null;
}

function projectConfirmPrompt() {
  return {
    question: 'Use this project directory for this task?',
    options: [
      {
        id: 'use-project',
        label: 'Use this project',
        description: 'Scope this task in the shown project directory.',
        recommended: true,
      },
      {
        id: 'choose-another',
        label: 'Choose another directory',
        description: 'Enter a different project folder before planning.',
      },
    ],
    defaultId: 'use-project',
    allowNaturalLanguage: true,
  };
}

function isConfirmProject(selection: ReturnType<typeof parseNumberedPromptSelection>): boolean {
  if (selection.kind === 'option') return selection.option.id === 'use-project';
  if (selection.kind !== 'natural-language') return false;

  return isYes(selection.text);
}

function isYes(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return trimmed === '' || trimmed === 'y' || trimmed === 'yes';
}

function isExit(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return trimmed === 'exit' || trimmed === 'quit' || trimmed === 'q' || trimmed === 'n' || trimmed === 'no';
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
