import readline from 'readline';
import { getConfig } from '../core/config-loader.js';
import { runPipeline, type WorkflowAnswers } from '../core/pipeline.js';
import { loadState, saveState } from '../core/state-manager.js';
import { scanRelevantFiles } from '../core/file-scanner.js';
import { resolveBridge } from '../core/agent-router.js';
import { suggestWorkflowAnswers, isOpenshellAvailable } from '../wizard/wizard-delegator.js';
import { promptDeclareProjectRoot } from '../core/root-guard.js';
import { loadActiveProject, saveActiveProject } from '../core/state-manager.js';

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function askWithSuggestion(rl: readline.Interface, question: string, suggestion: string): Promise<string> {
  console.log(`  Suggested: ${suggestion}`);
  const answer = await ask(rl, `  ${question} [Enter to accept]: `);
  return answer === '' ? suggestion : answer;
}

export async function runWorkflow(taskDescription: string, headless = false): Promise<void> {
  const config = getConfig();
  const state = loadState(process.cwd());

  // Ensure active project root is declared before any pipeline work
  let activeRoot = loadActiveProject();
  if (!activeRoot) {
    activeRoot = await promptDeclareProjectRoot();
    saveActiveProject(activeRoot);
    console.log(`[CleanClaw] Active project root set: ${activeRoot}`);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(`\n[CleanClaw] Planning task: "${taskDescription}"`);

  // Wizard delegation — when enabled, LLM pre-populates answers; developer confirms or overrides
  let suggestions = null;
  if (config.enableWizardDelegation && await isOpenshellAvailable()) {
    console.log('[CleanClaw] Wizard delegation enabled — generating suggestions...');
    const bridge = resolveBridge(config);
    suggestions = await suggestWorkflowAnswers(taskDescription, bridge);
    if (!suggestions) {
      console.log('[CleanClaw] Delegation failed — falling back to manual input.\n');
    }
  }

  if (!suggestions) {
    console.log('Answer each question — press Enter to skip optional ones.\n');
  }

  const why = suggestions
    ? await askWithSuggestion(rl, '1. Why does this task matter?', suggestions.why)
    : await ask(rl, '1. Why does this task matter / what problem does it solve? ');

  const scannedFiles = await scanRelevantFiles(taskDescription, process.cwd(), config);

  let files: string;
  if (scannedFiles.length > 0) {
    const showList = (list: string[]) => {
      const numbered = list.map((f, i) => `  ${i + 1}. ${f}`).join('\n');
      console.log(`\n[CleanClaw] Scanned repo. Relevant files found:\n${numbered}\n`);
    };
    showList(scannedFiles);

    const choice = await ask(rl, '2. [y] accept / [e] edit / [n] specify manually: ');

    if (choice === 'y' || choice === '') {
      files = scannedFiles.join(', ');
    } else if (choice === 'e') {
      const editableList = [...scannedFiles];
      showList(editableList);
      console.log('  Type +path to add, -number to remove, blank line to finish.');
      while (true) {
        const line = await ask(rl, '  > ');
        if (line === '') break;
        if (line.startsWith('+')) {
          editableList.push(line.slice(1).trim());
        } else if (line.startsWith('-')) {
          const idx = parseInt(line.slice(1).trim(), 10) - 1;
          if (idx >= 0 && idx < editableList.length) editableList.splice(idx, 1);
        }
        showList(editableList);
      }
      files = editableList.join(', ');
    } else {
      files = await ask(rl, '2. Which files should be changed? (Enter = let the agent decide) ');
    }
  } else {
    console.log('[CleanClaw] No relevant files found automatically.');
    files = await ask(rl, '2. Which files should be changed? (Enter = let the agent decide) ');
  }
  const criteria = suggestions
    ? await askWithSuggestion(rl, '3. Acceptance criteria — what does "done" look like?', suggestions.criteria)
    : await ask(rl, '3. Acceptance criteria — what does "done" look like? ');
  const outOfScope = suggestions
    ? await askWithSuggestion(rl, '4. Out of scope — what should NOT change?', suggestions.outOfScope)
    : await ask(rl, '4. Out of scope — what should NOT change? (Enter to skip) ');
  rl.close();

  const parts: string[] = [`Task: ${taskDescription}`];
  if (why)        parts.push(`Why: ${why}`);
  if (files) {
    const fileList = files.split(',').map(f => `- ${f.trim()}`).join('\n');
    parts.push(`Files confirmed:\n${fileList}`);
  }
  if (criteria)   parts.push(`Acceptance criteria: ${criteria}`);
  if (outOfScope) parts.push(`Out of scope: ${outOfScope}`);

  const fullDescription = parts.join('\n\n');

  const confirmedFiles = files ? files.split(',').map(f => f.trim()).filter(Boolean) : [];

  const workflowAnswers: WorkflowAnswers = { why, files, criteria, outOfScope };

  await runPipeline(fullDescription, config, workflowAnswers, scannedFiles, confirmedFiles, headless);

  saveState({
    projectName: config.projectName,
    currentTaskId: state?.currentTaskId ?? '01',
    currentVariant: 'A',
    plansDir: config.plansDir,
    lastUpdated: new Date().toISOString(),
    iterationCount: state?.iterationCount ?? 0,
    resumable: false,
    lastCompletedStep: 0,
  }, process.cwd());
}
